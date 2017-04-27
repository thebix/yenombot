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
        const newState = store.getState()
        balance = newState.balance[message.chat.id].balance
        store.dispatch(jsonSave(_config.fileState, newState))


        //сохранение истории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((data) => {
                    const id = new Date()
                    const historyItem = {
                        'id': id.getTime(),
                        'date_create': id,
                        'date_edit': id,
                        'date_delete': null,
                        'category': 'uncat',
                        'value': text,
                        'user_id': message.from,
                        'comment': ''
                    }

                    const history = data || []
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
                    // l('buttons', buttons)

                    // bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
                    bot.sendMessage(message.chat.id, `Выбери категорию 🤖`, {
                        reply_markup: JSON.stringify({
                            inline_keyboard: buttons
                        })
                    })
                })
                .catch(err => {
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }

        bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
    }
    categoryChange(message, bot, data) {
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_CATEGORY_CHANGE))

        //сохранение категории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((json) => {
                    const history = json || []
                    const category = JSON.parse(data)

                    const histId = new Date(category.historyId).getTime()
                    let article = history.filter(item => item.id == histId)
                    if(!article || article.length == 0){
                        bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                        return
                    }
                    article = article[0]
                    const groups = store.getState().paymentGroups[message.chat.id] || []
                    article.category = groups.filter(item => category.groupId == item.id)[0].title

                    FileSystem.saveJson(file, history)
                        .then(data => {
                            bot.sendMessage(message.chat.id, `${article.value}, ${article.category} 🤖`)
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
    balanceChange(message, bot) {
        l('balanceChange')
    }
    _mapGroupsToButtons(id, group) {
        return {
            text: group.title,
            callback_data: JSON.stringify({
                groupId: group.id,
                historyId: id
            })
        }
    }
}