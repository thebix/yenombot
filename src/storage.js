// in memory sotrage.

import { Observable, BehaviorSubject } from 'rxjs'
import lib from './lib/root'
import config from './config';

class Storage {
    constructor() {
        this.storage = {}
        this.isFsLoadedBehaviorSubject = new BehaviorSubject(false)
        // load saved storage from fs
        // TODO: check if directory and file exists, if not - create
        // TODO: add subscription to composite subscription and unsubscribe
        lib.fs.readJson(config.fileState)
            .do(fileStorage => {
                this.storage = fileStorage
            })
            .map(() => true)
            .subscribe(this.isFsLoadedBehaviorSubject)
    }
    isInitialized() {
        return this.isFsLoadedBehaviorSubject.asObservable()
    }
    loadFsStorage() {
        return Observable.of(true)
    }
    getItem(id, field) {
        if (!this.storage[id] || !this.storage[id][field])
            return null
        // TODO: ?make observable?
        return this.storage[id]
    }
    updateItem(id, fieldName, item) {
        // TODO: Should be extended with save/load from filesystem to save state on restart
        // TODO: rollback changes to fs storage to previous values on error
        const field = fieldName || '0'
        if (!this.storage[id])
            this.storage[id] = {}
        this.storage[id][field] = item
        return Observable.of(true)
    }
    // itemsArray = [{fieldName, item}]
    updateItems(id, itemsArray = []) {
        if (!this.storage[id])
            this.storage[id] = {}
        // TODO: Should be extended with save/load from filesystem to save state on restart
        // TODO: rollback changes to fs storage to previous values on error
        itemsArray.forEach(itemToSave => {
            const { fieldName, item } = itemToSave
            const field = fieldName || '0'
            this.storage[id][field] = item
        })

        return Observable.of(true)
    }
    removeItem(id, fieldName) {
        const field = fieldName || '0'
        if (this.storage[id]) {
            // TODO: Should be extended with save/load from filesystem to save state on restart
            delete this.storage[id][field]
        }
        return Observable.of(true)
    }
}

const storage = new Storage()

export default storage
