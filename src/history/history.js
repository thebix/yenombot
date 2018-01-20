// historyItem = {
//     'id': message.id,
//     'date_create': date,
//     'date_edit': date,
//     'date_delete': null,
//     'category': 'uncat',
//     'value': text,
//     'user_id': message.from,
//     'comment': ''
// }

import { Observable } from 'rxjs'
import { log, logLevel } from '../logger'
import config from '../config'
import lib from '../lib/root'

export class HistoryItem {
    constructor(
        id,
        userId,
        value,
        category = undefined,
        comment = undefined,
        dateCreate = undefined,
        dateEdit = undefined,
        dateDelete = undefined) {
        // TODO: requeired checks: id, userId, value
        const currentDate = new Date()
        this.id = id
        this.user_id = userId
        this.value = value
        this.category = category
        this.comment = comment
        this.date_create = dateCreate || currentDate
        this.date_edit = dateEdit || currentDate
        this.date_delete = dateDelete
    }
}

class History {
    constructor() {
        this.path = config.dirStorage
        this.fileTemplate = 'hist-$[id].json'
        this.getFilePath = this.getFilePath.bind(this)
    }
    add(historyItem, templateId = null) {
        if (!historyItem.id) throw new Error('Идентификатор обязателен для истории')
        if (!historyItem.user_id) throw new Error('user_id обязателен для истории')
        if (!historyItem.value) throw new Error('value обязателен для истории')
        if (!historyItem.date_create) throw new Error('date_create обязателен для истории')
        const file = this.getFilePath(templateId)
        return lib.fs.appendFile(file, JSON.stringify(historyItem))
            .catch(error => {
                log(`history:add: error while add to file historyItem. templateId: <${templateId}>, error=${error}`, logLevel.ERROR)
                return Observable.of(false)
            })
            .map(isAdded => isAdded !== false)
    }
    get(id, templateId = null) {
        return this.getAll(templateId)
            .map(allHistory => {
                const res = allHistory.filter(item => item.id === id)
                return res && res.length > 0
                    ? res[0]
                    : null
            })
    }
    update(id, newValue, templateId = null) {
        return this.getAll(templateId)
            .flatMap(allHistory => {
                let updatedItem
                let indexToEdit = -1
                let i = 0
                for (i; i < allHistory.length; i += 1) {
                    if (allHistory[i].id === id) {
                        indexToEdit = i
                        updatedItem = allHistory[i]
                        if (newValue.date_create !== undefined)
                            updatedItem.date_create = newValue.date_create
                        if (newValue.value !== undefined)
                            updatedItem.value = newValue.value
                        if (newValue.category !== undefined)
                            updatedItem.category = newValue.category
                        if (newValue.comment !== undefined)
                            updatedItem.comment = newValue.comment
                        if (newValue.date_edit !== undefined)
                            updatedItem.date_edit = newValue.date_edit
                        if (newValue.date_delete !== undefined)
                            updatedItem.date_delete = newValue.date_delete
                        break
                    }
                }
                if (!updatedItem) {
                    log(`History:setById: can't find historyItem by id:<${id}>, templateId:<${templateId}>. Adding as new.`, logLevel.ERROR)
                    return this.add(Object.assign({}, newValue, { id }), templateId)
                }
                const newHistory = [...allHistory.slice(0, indexToEdit), updatedItem, ...allHistory.slice(indexToEdit + 1)]
                const file = this.getFilePath(templateId)
                const newHistoryText = JSON.stringify(newHistory)
                return lib.fs.saveFile(file, newHistoryText.slice(1, newHistoryText.length - 2))
                    .catch(error => {
                        log(`history:update: error while update to file historyItem. id:<${id}>, templateId: <${templateId}>, error=${error}`,
                            logLevel.ERROR)
                        return Observable.of(false)
                    })
                    .map(isUpdated => isUpdated !== false)
            })
    }
    getAll(templateId = null) {
        const historyFile = this.getFilePath(templateId)
        // TODO: check if this.path and historyFile exists. return [] if not
        return lib.fs.readFile(historyFile)
            .catch(error => {
                log(`history:getAll: error while get from file historyItem. templateId: <${templateId}>, error=${error}`, logLevel.ERROR)
                return Observable.of('')
            })
            .map(historyFileContent => JSON.parse(`[${historyFileContent}]`))
    }
    getFilePath(templateId = null) {
        const file = templateId
            ? `${this.fileTemplate.replace('$[id]', templateId)}`
            : this.fileTemplate
        return `${this.path}${file}`
    }
}

const history = new History()

export default history
