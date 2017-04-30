import { Parser } from 'expr-eval'

import _config from '../config'
import { store } from '../server'
import { balanceInit, balanceChange, jsonSave, botCmd } from '../actions'
import _commands from '../enums/commands'
import FileSystem from '../filesystem'

import { l, log } from '../logger'

export default class Balance {
    constructor() {
        this._mapGroupsToButtons = this._mapGroupsToButtons.bind(this)
    }

    initIfNeed(message, bot) {
        const balance = store.getState().balance[message.chat.id]
        if (balance === undefined || balance === null || balance === '') {
            const period = new Date().getMonth()
            store.dispatch(balanceInit(message.chat.id, period))
        }
    }
    balance(message, bot) {
        const balance = store.getState().balance[message.chat.id]
        let res = ``
        if (balance === undefined || balance === null || balance === '') {
            store.dispatch(balanceInit(message.chat.id, period))
            res = store.getState().balanceInit[message.chat.id]
        }
        const period = new Date().getMonth()
        if (period != balance.period) {
            store.dispatch(balanceInit(message.chat.id, period))
            res = store.getState().balanceInit[message.chat.id]
        }
        res = balance.balance
        bot.sendMessage(message.chat.id, `Остаток ${res} 🤖`)
        return res

    }
    change(message, bot) {
        let { text } = message
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_CHANGE))

        const parser = new Parser()
        try {
            text = parser.parse(text).evaluate()
        } catch (ex) {
            bot.sendMessage(message.chat.id, `Не понял выражение 🤖`)
            return
        }

        const period = new Date().getMonth()
        let balance = store.getState().balance[message.chat.id]
        if (balance && balance.period != period)
            store.dispatch(balanceInit(message.chat.id, period))
        store.dispatch(balanceChange(message.chat.id, period, text))
        const newState = store.getState() //TODO: так нехорошо, надо высчитывать баланс
        balance = newState.balance[message.chat.id].balance
        store.dispatch(jsonSave(_config.fileState, newState))

        const sendBalance = () => {
            const { id } = message
            bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{
                        text: "Удалить",
                        callback_data: JSON.stringify({
                            hId: id,
                            cmd: _commands.BALANCE_REMOVE
                        })
                    }]
                    ]
                })
            })
        }

        //сохранение истории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((data) => {
                    const date = new Date()
                    const { id } = message
                    const historyItem = {
                        'id': message.id,
                        'date_create': date,
                        'date_edit': date,
                        'date_delete': null,
                        'category': 'uncat',
                        'value': text,
                        'user_id': message.from,
                        'comment': ''
                    }
                    let history = data
                    if (!history || history.constructor !== Array)
                        history = []
                    history.push(historyItem)
                    FileSystem.saveJson(file, history)
                        .then(data => { })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })


                    const groups = newState.paymentGroups[message.chat.id]
                    if (!groups || groups.length == 0) { //для чата не заданы группы
                        return
                    }

                    const rowCount = 2
                    const remDiv = groups.length % 3
                    const rows = parseInt(groups.length / rowCount)
                        + (remDiv ? 1 : 0)

                    let i = 0
                    const buttons = []
                    for (i; i < rows; i++) {
                        if (i != rows - 1)
                            buttons.push(
                                groups.slice(i * rowCount, i * rowCount + rowCount)
                                    .map(group => this._mapGroupsToButtons(id, group))
                            )
                        else
                            buttons.push(
                                groups.slice(i * rowCount, i * rowCount + remDiv)
                                    .map(group => this._mapGroupsToButtons(id, group))
                            )
                    }
                    bot.sendMessage(message.chat.id, `Выбери категорию 🤖`, {
                        reply_markup: JSON.stringify({
                            inline_keyboard: buttons
                        })
                    }).then(x=> {
                        sendBalance()
                    }).catch(ex=> {
                        sendBalance()
                    })
                    
                })
                .catch(err => {
                    sendBalance()
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }

    }
    categoryChange(message, bot, data) {
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_CATEGORY_CHANGE))

        //сохранение категории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((json) => {
                    const history = json || []
                    const category = data

                    const { hId } = category
                    let article = history.filter(item => item.id == hId)
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                        return
                    }
                    article = article[0]
                    const groups = store.getState().paymentGroups[message.chat.id] || []
                    let oldCategory = ``
                    if (article.category && article.category != 'uncat')
                        oldCategory = `${article.category} -> `
                    article.category = groups.filter(item => category.gId == item.id)[0].title

                    FileSystem.saveJson(file, history)
                        .then(data => {
                            bot.sendMessage(message.chat.id, `${article.value}, ${oldCategory}${article.category} 🤖`)
                        })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })
                })
                .catch(err => {
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }
    }
    commentChange(message, bot) {
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_COMMENT_CHANGE))

        //сохранение коммента к последней записи
        //TODO: вынести общий код в History
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((json) => {
                    const history = json || []
                    let article = history.sort((i1, i2) => i2.id - i1.id)
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                        return
                    }
                    article = article[0]
                    article.comment = message.text

                    FileSystem.saveJson(file, history)
                        .then(data => {
                            bot.sendMessage(message.chat.id, `${article.value}, ${article.comment} 🤖`)
                        })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })
                })
                .catch(err => {
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }
    }
    delete(message, bot, data) {
        //удаление записи
        //TODO: вынести общий код
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((json) => {
                    const history = json || []
                    const category = data

                    const { hId } = category
                    let article = history.filter(item => item.id == hId)
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                        return
                    }
                    article = article[0]
                    if (article.date_delete) {
                        bot.sendMessage(message.chat.id, `Запись уже была удалена 🤖`)
                        return
                    }
                    store.dispatch(botCmd(message.chat.id, _commands.BALANCE_REMOVE))
                    article.date_delete = new Date()

                    const balance = store.getState().balance[message.chat.id] || {}
                    let success
                    if (balance.period != article.date_delete.getMonth()) {
                        success = `${article.value} удалено из истории. Остаток за текущий месяц не изменился 🤖`
                    } else {
                        store.dispatch(balanceChange(message.chat.id,
                            new Date(article.date_create).getMonth(),
                            -article.value))
                        success = `${article.value} удалено из истории. Остаток ${parseInt(balance.balance) + parseInt(article.value)} 🤖`
                    }

                    FileSystem.saveJson(file, history)
                        .then(data => {
                            bot.sendMessage(message.chat.id, success)
                        })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })
                })
                .catch(err => {
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }
    }
    _mapGroupsToButtons(id, group) {
        return {
            text: group.title,
            callback_data: JSON.stringify({
                gId: group.id,
                hId: id,
                cmd: _commands.BALANCE_CATEGORY_CHANGE
            })
        }
    }
}