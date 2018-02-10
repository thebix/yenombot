// in memory sotrage.

import { Observable, BehaviorSubject, Subscription } from 'rxjs'
import lib from './lib/root'
import config from './config';
import { log, logLevel } from './logger';

export const archiveName = 'storage_archive'

const compositeSubscription = new Subscription()

class Storage {
    constructor() {
        this.storage = {}
        this.isFsLoadedBehaviorSubject = new BehaviorSubject(false)
        compositeSubscription.add(
            // load saved storage from fs
            // check if directory and file exists, if not - create
            lib.fs.isExists(config.dirStorage)
                .switchMap(isStorageDirExists => {
                    if (isStorageDirExists !== true) {
                        log(`Storage:constructor: storage directory doesn't exists, creating. path: <${config.dirStorage}>`, logLevel.INFO)
                        return lib.fs.mkDir(config.dirStorage)
                            .switchMap(() => lib.fs.isExists(config.fileState))
                            .catch(error => {
                                throw new Error(`Storage:constructor: can't create storage directory. path: <${config.dirStorage}>. error: <${error}>`)
                            })
                    }
                    return lib.fs.isExists(config.fileState)
                })
                .switchMap(isStateFileExists => {
                    if (isStateFileExists !== true) {
                        log(`Storage:constructor: state file doesn't exists, creating. path: <${config.fileState}>`, logLevel.INFO)
                        return lib.fs.saveJson(config.fileState, {})
                            .map(() => true)
                            .catch(error => {
                                throw new Error(`Storage:constructor: can't create state file. path: <${config.fileState}>. error: <${error}>`)
                            })
                    }
                    return Observable.of(true)
                })
                .switchMap(isStorageDirAndStateFileExists => {
                    if (isStorageDirAndStateFileExists)
                        return lib.fs.readJson(config.fileState)
                            .do(fileStorage => {
                                this.storage = fileStorage
                            })
                            .map(() => true)
                            .catch(error => {
                                throw new Error(`Storage:constructor: can't read state file. path: <${config.fileState}>. error: <${error}>`)
                            })
                    return Observable.of(false)
                })
                .subscribe(
                    initResult => {
                        this.isFsLoadedBehaviorSubject.next(initResult)
                        compositeSubscription.unsubscribe()
                    },
                    initError => {
                        log(initError, logLevel.ERROR)
                        compositeSubscription.unsubscribe()
                    })
        )
    }
    isInitialized() {
        return this.isFsLoadedBehaviorSubject.asObservable()
    }
    getStorageKeys() {
        return Observable.of(Object.keys(this.storage))
    }
    getItem(id, field) {
        if (!this.storage[id] || !this.storage[id][field])
            return Observable.of(null)
        return Observable.of(this.storage[id][field])
    }
    getItems(id, fieldsArray = []) {
        const result = {}
        fieldsArray.forEach(field => {
            result[field] = this.storage[id] && this.storage[id][field]
                ? this.storage[id][field] : null
        })
        return Observable.of(result)
    }
    updateItem(id, fieldName, item) {
        const field = fieldName || '0'
        if (!this.storage[id])
            this.storage[id] = {}
        this.storage[id][field] = item
        const oldValue = Object.assign({}, this.storage[id][field])
        return lib.fs.saveJson(config.fileState, this.storage)
            .map(() => true)
            .catch(error => {
                log(`Storage:updateItem: can't save to state file. path: <${config.fileState}>, error:<${error}>`, logLevel.ERROR)
                // rollback changes to fs storage to previous values on error
                this.storage[id][field] = oldValue
                return Observable.of(false)
            })
    }
    // itemsArray = [{fieldName, item}]
    updateItems(id, itemsArray = []) {
        if (!this.storage[id])
            this.storage[id] = {}
        const oldValues = {}
        itemsArray.forEach(itemToSave => {
            const { fieldName, item } = itemToSave
            const field = fieldName || '0'
            oldValues[field] = Object.assign({}, this.storage[id][field])
            this.storage[id][field] = item
        })
        return lib.fs.saveJson(config.fileState, this.storage)
            .map(() => true)
            .catch(error => {
                log(`Storage:updateItems: can't save to state file. path: <${config.fileState}>, error:<${error}>`, logLevel.ERROR)
                // rollback changes to fs storage to previous values on error
                itemsArray.forEach(itemToSave => {
                    const { fieldName } = itemToSave
                    const field = fieldName || '0'
                    this.storage[id][field] = oldValues[field]
                })
                return Observable.of(false)
            })
    }
    removeItem(id, fieldName) {
        const field = fieldName || '0'
        if (this.storage[id]) {
            const oldValue = Object.assign({}, this.storage[id][field])
            delete this.storage[id][field]
            return lib.fs.saveJson(config.fileState, this.storage)
                .map(() => true)
                .catch(error => {
                    log(`Storage:removeItem: can't save to state file. path: <${config.fileState}>, error:<${error}>`, logLevel.ERROR)
                    // rollback changes to fs storage to previous values on error
                    this.storage[id][field] = oldValue
                    return Observable.of(false)
                })
        }
        return Observable.of(true)
    }
    archive(id) {
        const archive = this.storage[archiveName] || {}
        if (id !== archiveName && this.storage[id]) {
            archive[id] = this.storage[id]
            this.storage[archiveName] = archive
            delete this.storage[id]
            return lib.fs.saveJson(config.fileState, this.storage)
                .map(() => true)
                .catch(error => {
                    log(`Storage:archive: can't save to state file. path: <${config.fileState}>, error:<${error}>`, logLevel.ERROR)
                    // rollback changes to fs storage to previous values on error
                    this.storage[id] = archive[id]
                    delete this.storage[archiveName][id]
                    return Observable.of(false)
                })
        }
        return Observable.of(true)
    }
}

const storage = new Storage()

export default storage
