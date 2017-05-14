import { l, log, logLevel } from '../logger'
import FileSystem from './filesystem'

export default class History {
    constructor(path = './', fileTemplate = 'hist-${id}.json') {
        this._path = path
        if (this._path && this._path.length > 0 && this._path[this._path.length - 1] !== '/') {
            this._path = `${this._path}/`
        }
        this._fileTemplate = fileTemplate

        this.getById = this.getById.bind(this)
        this.setById = this.setById.bind(this)
        this.getAll = this.getAll.bind(this)

        this._getFilePath = this._getFilePath.bind(this)
    }
    create(value, templateId = null) {
        if (!value.id) throw 'Идентификатор обязателен для истории'
        if (!value.user_id) throw 'user_id обязателен для истории'
        if (!value.value) throw 'value обязателен для истории'
        if (!value.date_create) throw 'date_create обязателен для истории'
        const file = this._getFilePath(templateId)
        return this.getAll(templateId)
            .then(all => {
                if (!all || all.constructor !== Array)
                    all = []
                all.push(value)
                return FileSystem.saveJson(file, all)
            })
            .catch(err => Promise.reject(err))
    }
    getById(id, templateId = null) {
        return this.getAll(templateId)
            .then(all => {
                if (!all || all.constructor !== Array)
                    all = []
                let res = all.filter(item => item.id == id)
                if (res && res.length > 0) res = res[0]
                else res = null
                return Promise.resolve(res)
            }).catch(err => Promise.reject(err))
    }
    setById(id, newValue, templateId = null) {
        return this.getAll(templateId)
            .then(all => {

                if (!all || all.constructor !== Array)
                    all = []
                let item = all.filter(item => item.id == id)
                if (item && item.length > 0) item = item[0]

                if (newValue.value !== undefined)
                    item.value = newValue.value
                if (newValue.category !== undefined)
                    item.category = newValue.category
                if (newValue.comment !== undefined)
                    item.comment = newValue.comment
                if (newValue.date_edit !== undefined)
                    item.date_edit = newValue.date_edit
                if (newValue.date_delete !== undefined)
                    item.date_delete = newValue.date_delete

                const file = this._getFilePath(templateId)
                return FileSystem.saveJson(file, all)
                    .then(data => Promise.resolve(item))

            }).catch(err => Promise.reject(err))

    }
    getAll(templateId = null) {
        const path = this._getFilePath(templateId)

        if (FileSystem.isDirExists(this._path, true)
            && FileSystem.isFileExists(path, true, null, '[]')) {
            return FileSystem.readJson(path)
                .then(all => {
                    if (!all || all.constructor !== Array) {
                        all = []
                        log(`Для '${templateId}' не удалось нормально прочитать файл '${path}'`)
                    }
                    return Promise.resolve(all.sort((i1, i2) => i2.id - i1.id))
                })
                .catch(ex => Promise.reject(`Для '${templateId}' не удалось нормально прочитать файл '${path}', ex = '${ex}'`))
            // return FileSystem.readJson(path)
        }
        return Promise.reject('Problem with file access')
    }
    _getFilePath(templateId = null) {
        const file = templateId
            ? `${this._fileTemplate.replace('${id}', templateId)}`
            : this._fileTemplate
        return `${this._path}${file}`
    }
}

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
// class HistoryItem {
//     constructor({ id, user_id, value, category = null, comment = null, date_create = null, date_edit = null, date_delete = null }) {
//         if (!id) throw 'Идентификатор обязателен для истории'
//         if (!user_id) throw 'user_id обязателен для истории'
//         if (!value) throw 'value обязателен для истории'
//         const currentDate = new Date()
//         this.id = id
//         this.user_id = user_id
//         this.value = value
//         this.category = category
//         this.comment = comment
//         this.date_create = date_create || currentDate
//         this.date_edit = date_edit || currentDate
//         this.date_delete = date_delete
//     }
//     update({ value, category, comment, date_edit, date_delete }) {
//         this.value = value || this.value
//         this.category = category || this.category
//         this.comment = comment || this.comment
//         this.date_edit = date_edit || this.date_edit
//         this.date_delete = date_delete || this.date_delete
//     }
// }