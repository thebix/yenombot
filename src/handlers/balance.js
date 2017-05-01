import { Parser } from 'expr-eval'
import { Readable } from 'stream'
import _config from '../config'
import { store } from '../server'
import { balanceInit, balanceChange, jsonSave, botCmd } from '../actions'
import _commands from '../enums/commands'
import FileSystem from '../filesystem'

import { l, log, logLevel, getDateString } from '../logger'

import fs from 'fs'
import str from 'string-to-stream'
import json2csv from 'json2csv'

export default class Balance {
    constructor() {
        this._mapGroupsToButtons = this._mapGroupsToButtons.bind(this)
        this._sendBalance = this._sendBalance.bind(this)
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

        //сохранение истории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isDirExists(_config.dirStorage, true)
            && FileSystem.isFileExists(file, true, null, '[]')) {
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
                        .then(data => {
                            data = data //TODO: Callig w/o callback is deprecated
                        })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })


                    const groups = newState.paymentGroups[message.chat.id]
                    if (!groups || groups.length == 0) { //для чата не заданы группы
                        this._sendBalance(message, balance)
                        return
                    }

                    const cols = 3 // кол-во в блоке
                    const buttons = [] //результат
                    const blocksCount = parseInt(groups.length / cols)
                        + ((groups.length % cols) > 0 ? 1 : 0)
                    for (let i = 0; i < blocksCount; i++) {
                        buttons.push(
                            groups.slice(i * cols, i * cols + cols)
                                .map(group => this._mapGroupsToButtons(id, group))
                        )
                    }

                    bot.sendMessage(message.chat.id, `Записал ${text}`, {
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
                    }).then(x => {
                        bot.sendMessage(message.chat.id, `Выбери категорию 🤖`, {
                            reply_markup: JSON.stringify({
                                inline_keyboard: buttons
                            })
                        }).then(x => {
                            this._sendBalance(message, bot, balance)
                        }).catch(ex => {
                            this._sendBalance(message, bot, balance)
                        })
                    }).catch(ex => {
                        this._sendBalance(message, bot, balance)
                    })

                })
                .catch(err => {
                    this._sendBalance(message, bot, balance)
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
                    const comment = article.comment ? `, ${article.comment}` : ``
                    FileSystem.saveJson(file, history)
                        .then(data => {
                            bot.sendMessage(message.chat.id, `${article.value}, ${oldCategory}${article.category}${comment} 🤖`)
                                .then((data) => {
                                    const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                                    this._sendBalance(message, bot, balance)
                                })
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
                            bot.sendMessage(message.chat.id, `${article.value}, ${article.category}, ${article.comment} 🤖`)
                                .then((data) => {
                                    const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                                    this._sendBalance(message, bot, balance)
                                })
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
    _sendBalance = (message, bot, balance, options) => {
        const { id } = message
        bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`, options)
    }

    report(message, bot) {
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isDirExists(_config.dirStorage, true)
            && FileSystem.isFileExists(file)) {
            FileSystem.readJson(file)
                .then((json) => {
                    const { users } = store.getState()
                    var fields = [{
                        label: 'Дата', // Supports duplicate labels (required, else your column will be labeled [function]) 
                        value: function (row, field, data) {
                            return getDateString(new Date(row.date_create))
                        },
                        default: 'NULL' // default if value function returns null or undefined 
                    }, 'value', 'category', 'comment', {
                        label: 'Юзер', // Supports duplicate labels (required, else your column will be labeled [function]) 
                        value: function (row, field, data) {
                            return `${users[row.user_id].firstName} ${users[row.user_id].lastName}`
                        },
                        default: 'NULL' // default if value Îfunction returns null or undefined 
                    }];
                    const fieldNames = ['Дата', 'Сумма', 'Категория', 'Комментарий', 'Юзер']
                    var csv = json2csv({ data: json, fields, fieldNames });
                    if (FileSystem.isDirExists(_config.dirStorage, true)
                        && FileSystem.isDirExists(`${_config.dirStorage}repo`, true)) {
                        const file = `repo-${message.chat.title}.csv` //TODO: для каждого чата отдельно, или даже для юзера
                        FileSystem.saveFile(`${_config.dirStorage}repo/${file}`, csv)
                            .then((data) => {
                                bot.sendDocument(message.chat.id, `${_config.dirStorage}repo/${file}`)
                                    .then((data) => {
                                        const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                                        this._sendBalance(message, bot, balance)
                                    })
                                    .catch(ex => log(ex, logLevel.ERROR))
                            })
                            .catch(ex => log(ex, logLevel.ERROR))
                    }
                })
                .catch(err => { log(`report: Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`, logLevel.ERROR) })

        } else {
            bot.sendMessage(message.chat.id, `Нет ранее сохраненных трат для этого чата 🤖`)
        }
    }
}


