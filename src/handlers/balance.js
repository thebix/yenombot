import { Parser } from 'expr-eval'
import { Readable } from 'stream'
import _config from '../config'
import { store, history } from '../server'
import {
    balanceInit, balanceChange, jsonSave, botCmd,
    setBotBalanceMessageId
} from '../actions'
import _commands from '../enums/commands'
import FileSystem from '../lib/filesystem'
import lib from '../lib/index'

import { l, log, logLevel, dateTimeString } from '../logger'

import fs from 'fs'
import json2csv from 'json2csv'

export default class Balance {
    constructor() {
        this._mapGroupsToButtons = this._mapGroupsToButtons.bind(this)
        this._sendBalance = this._sendBalance.bind(this)
        this._getUsersSums = this._getUsersSums.bind(this)
        this._getCategoriesSums = this._getCategoriesSums.bind(this)
        this._getCategoriesPercents = this._getCategoriesPercents.bind(this)
    }

    initIfNeed(message, bot) {
        const balance = store.getState().balance[message.chat.id]
        if (balance === undefined || balance === null || balance === '') {
            this.init(message, bot)
        }
    }
    init(message, bot) {
        const period = new Date().getMonth()
        store.dispatch(balanceInit(message.chat.id, period))
        this.balance(message, bot)

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
        this.stats(message, bot)
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

        // 
        const groups = newState.paymentGroups[message.chat.id]
        if (!groups || groups.length == 0) { //для чата не заданы группы
            return this._sendBalance(message, bot, balance)
        }

        // сохранение истории
        const date = new Date()
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
        let success = `Записал ${text}`
        bot.sendMessage(message.chat.id, `${success} 🤖`)
            .then(x => {
                const cols = 3 // кол-во в блоке
                let buttons = [] //результат
                const blocksCount = parseInt(groups.length / cols)
                    + ((groups.length % cols) > 0 ? 1 : 0)
                for (let i = 0; i < blocksCount; i++) {
                    buttons.push(
                        groups.slice(i * cols, i * cols + cols)
                            .map(group => this._mapGroupsToButtons(x.message_id, group))
                    )
                }
                bot.editMessageText(`${success}. Выбери категорию 🤖`, {
                    message_id: x.message_id,
                    chat_id: message.chat.id,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[{
                            text: "Удалить",
                            callback_data: JSON.stringify({
                                hId: x.message_id,
                                cmd: _commands.BALANCE_REMOVE
                            })
                        }], ...buttons
                        ]
                    })
                })
                historyItem.id = x.message_id
                history.create(historyItem, message.chat.id)
                    .then(x => { })
                    .catch(ex => log(ex, logLevel.ERROR))
                return this._sendBalance(message, bot, balance)
            }).catch(ex => {
                log(`Ошибка сохранения отправки сообщения боту. История записана с id сообщения от пользовалея = ${historyItem.id}. err = ${ex}.`)
                history.create(historyItem, message.chat.id)
                return this._sendBalance(message, bot, balance)
            })
    }
    categoryChange(message, bot, data) {
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_CATEGORY_CHANGE))

        //сохранение категории
        const { hId, gId } = data
        return history.getById(hId, message.chat.id)
            .then(item => {
                if (!item) {
                    bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                    return Promise.reject(`Не удалось найти запись в истории 🤖`)
                }
                const groups = store.getState().paymentGroups[message.chat.id] || []
                let oldCategory = ``
                if (item.category && item.category != 'uncat')
                    oldCategory = `${item.category} -> `
                item.category = groups.filter(x => gId == x.id)[0].title
                const comment = item.comment ? `, ${item.comment}` : ``
                return history.setById(hId, item, message.chat.id)
                    .then(data => {
                        return bot.editMessageText(`${item.value}, ${oldCategory}${item.category}${comment} 🤖`, {
                            message_id: hId,
                            chat_id: message.chat.id,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [[{
                                    text: "Удалить",
                                    callback_data: JSON.stringify({
                                        hId: hId,
                                        cmd: _commands.BALANCE_REMOVE
                                    })
                                }]]
                            })
                        })
                    })
                    .catch(ex => log(ex, logLevel.ERROR))
            }).catch(ex => log(ex, logLevel.ERROR))
    }
    commentChange(message, bot) {
        store.dispatch(botCmd(message.chat.id, _commands.BALANCE_COMMENT_CHANGE))

        // сохранение коммента к последней записи
        return history.getAll(message.chat.id)
            .then(all => {
                if (!all || all.constructor !== Array)
                    all = []
                let article = all.sort((i1, i2) => i2.id - i1.id)
                if (!article || article.length == 0) {
                    return bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                }
                article = article[0]
                article.comment = message.text

                return history.setById(article.id, article, message.chat.id)
                    .then(data => {
                        bot.editMessageText(`${article.value}, ${article.category}, ${article.comment} 🤖`, {
                            message_id: article.id,
                            chat_id: message.chat.id,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [[{
                                    text: "Удалить",
                                    callback_data: JSON.stringify({
                                        hId: article.id,
                                        cmd: _commands.BALANCE_REMOVE
                                    })
                                }]]
                            })
                        }).then((data) => {
                            const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                            return this._sendBalance(message, bot, balance)
                        }).catch(ex => log(ex, logLevel.ERROR))
                    })
            }).catch(ex => log(ex, logLevel.ERROR))
    }
    delete(message, bot, data) {
        // удаление записи
        const { hId, gId } = data
        let success = ''
        let newBalance = undefined
        return history.getById(hId, message.chat.id)
            .then(item => {
                if (!item) {
                    bot.sendMessage(message.chat.id, `Не удалось найти запись в истории 🤖`)
                    return Promise.reject(`Не удалось найти запись в истории 🤖`)
                }
                if (item.date_delete) {
                    // bot.sendMessage(message.chat.id, `Запись уже была удалена 🤖`)
                    return Promise.resolve()
                }
                store.dispatch(botCmd(message.chat.id, _commands.BALANCE_REMOVE))
                item.date_delete = new Date()
                const balance = store.getState().balance[message.chat.id] || {}
                if (balance.period != item.date_delete.getMonth()) {
                    success = `${item.value} удалено из истории. Остаток за текущий месяц не изменился 🤖`
                } else {
                    store.dispatch(balanceChange(message.chat.id,
                        new Date(item.date_create).getMonth(),
                        -item.value))
                    newBalance = parseInt(balance.balance) + parseInt(item.value)
                    success = `${item.value}, ${item.category}, ${item.comment} удалено из истории 🤖`
                }
                return history.setById(hId, item, message.chat.id)
            })
            .then(item => {
                if (newBalance !== undefined)
                    this._sendBalance(message, bot, newBalance, false)
                return bot.editMessageText(`${success}`, {
                    message_id: hId,
                    chat_id: message.chat.id
                })
            })
            .catch(ex => log(ex, logLevel.ERROR))
    }
    _mapGroupsToButtons(id, group, replyId) {
        return {
            text: group.title,
            callback_data: JSON.stringify({
                gId: group.id,
                hId: id,
                rId: replyId,
                cmd: _commands.BALANCE_CATEGORY_CHANGE
            })
        }
    }
    _sendBalance = (message, bot, balance, isNewMessage = true) => {
        const messageId = store.getState().botBalanceMessageId[message.chat.id]
        if (!messageId || isNewMessage) {
            return bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
                .then(x => {
                    store.dispatch(setBotBalanceMessageId(message.chat.id, x.message_id))
                })
        }
        else
            return bot.editMessageText(`Остаток ${balance} 🤖`, {
                message_id: messageId,
                chat_id: message.chat.id,
            })
    }

    report(message, bot) {
        let file
        return history.getAll(message.chat.id)
            .then(all => {
                // if (!all || all.constructor !== Array)
                //     all = []

                all = all.filter(x => !x.date_delete).sort((a, b) => b.id - a.id)

                const { users } = store.getState()
                var fields = [{
                    label: 'Дата', // Supports duplicate labels (required, else your column will be labeled [function]) 
                    value: function (row, field, data) {
                        return dateTimeString(new Date(row.date_create))
                    },
                    default: 'NULL' // default if value function returns null or undefined 
                }, 'value', 'category', 'comment', {
                    label: 'Юзер', // Supports duplicate labels (required, else your column will be labeled [function]) 
                    value: function (row, field, data) {
                        return `${users[row.user_id].firstName} ${users[row.user_id].lastName}`
                    },
                    default: 'NULL' // default if value Îfunction returns null or undefined 
                }, 'id'];
                const fieldNames = ['Дата', 'Сумма', 'Категория', 'Комментарий', 'Юзер', 'id']
                var csv = json2csv({ data: all, fields, fieldNames });
                if (FileSystem.isDirExists(_config.dirStorage, true)
                    && FileSystem.isDirExists(`${_config.dirStorage}repo`, true)) {
                    file = `repo-${message.chat.title}.csv`

                    return FileSystem.saveFile(`${_config.dirStorage}repo/${file}`, csv)
                }
                return bot.sendMessage(message.chat.id, `Нет ранее сохраненных трат для этого чата 🤖`)
            })
            .then((data) => {
                return bot.sendDocument(message.chat.id, `${_config.dirStorage}repo/${file}`)
            })
            .then((data) => {
                const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                return this._sendBalance(message, bot, balance)
            })
            .catch(ex => log(ex, logLevel.ERROR))
    }

    stats(message, bot) {
        //TODO: получить из message { dateStart = null, dateEnd = null, userId = null, }
        const dateEnd = new Date(2017, 4, 12)
        const dateEndTime = dateEnd.getTime()

        const dateStart = lib.time.getChangedDateTime({ days: -4 }, dateEnd)
        const dateStartTime = dateStart.getTime()

        const userId = null //84677480

        const dateEndUser = lib.time.getChangedDateTime({ days: -1 }, dateEnd) //юзеру показывается дата на 1 меньше
        const { users, paymentGroups } = store.getState()
        const hasCats = paymentGroups[message.chat.id]
            && Object.keys(paymentGroups[message.chat.id]).length > 0

        // сколько потрачено за период / в среднем за прошлые
        let titleInfo = `Период: ${lib.time.dateWeekdayString(dateStart)} - ${lib.time.dateWeekdayString(dateEndUser)}\nДней: ${lib.time.daysBetween(dateStart, dateEnd)}`
        bot.sendMessage(message.chat.id, `${titleInfo} 🤖`)
        let sumsText = `Потрачено [в этом | в среднем]:`
        let sumsCatsText = `По категориям [в этом | в среднем]:`
        let percCatsText = `Проценты [в этом | за все время]:`
        let categories = hasCats ? paymentGroups[message.chat.id].sort((cat1, cat2) => cat1.id - cat2.id) : []

        let usersSumsByCurrent = {}
        let catsSumsByCurrent = {}
        const usersSumsBefore = {}
        const catsSumsBefore = {}
        let all = [] //все записи истории чата
        const periods = [] //все прошлые периоды (кроме текущего)

        return history.getAll(message.chat.id)
            .then(data => { //
                all = data
                if (!all || all.length == 0)
                    return bot.sendMessage(message.chat.id, `Нет истории. 🤖`)

                // получение интервалов
                const dateFirst = new Date(all[all.length - 1].date_create)
                const dateFirstTime = dateFirst.getTime()
                const curTicks = dateEndTime - dateStartTime
                let curDateEnd = lib.time.getChangedDateTime({ ticks: -1 }, dateStart)
                let curDateStart = lib.time.getChangedDateTime({ ticks: -curTicks }, curDateEnd)
                while (curDateEnd.getTime() >= dateFirstTime) {
                    periods.push({
                        start: curDateStart,
                        end: curDateEnd
                    })
                    curDateEnd = lib.time.getChangedDateTime({ ticks: -1 }, curDateStart)
                    curDateStart = lib.time.getChangedDateTime({ ticks: -curTicks }, curDateEnd)
                }

                // получение за прошлые периоды
                periods.forEach(period => {
                    // сколько потрачено за период / в среднем за прошлые
                    const curUsrSums = this._getUsersSums(all, period.start, period.end)
                    const allKeys = Object.keys(usersSumsBefore)
                    Object.keys(curUsrSums).forEach(key => {
                        if (allKeys.indexOf(key) != -1)
                            usersSumsBefore[key] = usersSumsBefore[key] + curUsrSums[key]
                        else
                            usersSumsBefore[key] = curUsrSums[key]
                    })

                    // траты по категориям / средние траты за %период%
                    if (hasCats) {
                        const curCatSums = this._getCategoriesSums(all, period.start, period.end, userId)
                        const allCatSumsKeys = Object.keys(catsSumsBefore)
                        Object.keys(curCatSums).forEach(key => {
                            if (allCatSumsKeys.indexOf(key) != -1)
                                catsSumsBefore[key] = catsSumsBefore[key] + curCatSums[key]
                            else
                                catsSumsBefore[key] = curCatSums[key] || 0
                        })
                    }
                })

                return Promise.resolve(true)
            })
            .then(initDone => {
                usersSumsByCurrent = this._getUsersSums(all, dateStart, dateEnd)  // траты в этом месяце

                // сколько потрачено за период / в среднем за прошлые
                Object.keys(usersSumsByCurrent).forEach(userId => {
                    const userName = `${users[userId].firstName} ${users[userId].lastName}`
                    const sum = Math.round(usersSumsByCurrent[userId])
                    sumsText = `${sumsText}\r\n${userName}: ${sum} | ${usersSumsBefore[userId] / periods.length}` //TODO: учитывать при этом не полный интервал (первый)
                })
                return bot.sendMessage(message.chat.id, `${sumsText} 🤖`)
            })
            .then(d => {
                if (!hasCats) return Promise.resolve({})
                catsSumsByCurrent = this._getCategoriesSums(all, dateStart, dateEnd, userId) // траты по категориям 
                categories = categories.sort((cat1, cat2) => catsSumsByCurrent[cat2.title] - (catsSumsByCurrent[cat1.title]))

                // траты по категориям / средние траты за %период%
                categories.forEach(cat => {
                    const cur = Math.round(catsSumsByCurrent[cat.title])
                    const bef = Math.round(catsSumsBefore[cat.title] / periods.length)
                    if (!cur || (!cur && !bef))
                        return true
                    sumsCatsText = `${sumsCatsText}\r\n${cat.title}: ${cur || 0} | ${bef || 0}` //TODO: учитывать при этом не полный интервал (первый)
                })
                return bot.sendMessage(message.chat.id, `${sumsCatsText} 🤖`)

            })
            .then(d => {
                if (!hasCats) return Promise.resolve({})
                //поцентное соотношение по группам / (не сделал)в среднем до этого за %период% / за все время
                const cats = this._getCategoriesPercents(catsSumsByCurrent)
                const catsBefore = this._getCategoriesPercents(catsSumsBefore)

                categories.forEach(cat => {
                    const cur = Math.round(cats[cat.title])
                    const bef = Math.round(catsBefore[cat.title])
                    if (!cur || (!cur && !bef))
                        return true

                    percCatsText = `${percCatsText}\r\n${cat.title}: ${cur || 0}% | ${bef || 0}%` //TODO: учитывать при этом не полный интервал (первый)
                })
                return bot.sendMessage(message.chat.id, `${percCatsText} 🤖`)
            })
            .then(d=> {
                const balance = store.getState().balance[message.chat.id].balance //TODO: нужна проверка, что баланс этого периода
                return this._sendBalance(message, bot, balance)
            })
            .catch(ex => log(ex, logLevel.ERROR))
    }

    _getCategoriesPercents(catsSums) {
        const categories = Object.keys(catsSums)
        const sum = categories.reduce((acc, val) => {
            if (isNaN(catsSums[val]))
                return acc
            return acc + catsSums[val]
        }, 0)
        const result = {}
        let sumWithoutLast = 0
        categories.forEach((cat, i) => {
            if (isNaN(catsSums[cat]))
                result[cat] = 'err'
            else if (i == (categories.length - 1))
                result[cat] = 100 - sumWithoutLast
            else {
                result[cat] = Math.round(catsSums[cat] * 100 / sum)
                sumWithoutLast += result[cat]
            }
        })
        return result
    }

    // сколько потрачено за период / в среднем за прошлые
    _getUsersSums(all = [], dateStart = new Date(), dateEnd = new Date()) {
        const dateStartTime = dateStart.getTime()
        const dateEndTime = dateEnd.getTime()

        const current = all //filter
            .filter(item => !dateStartTime || new Date(item.date_create).getTime() >= dateStartTime)
            .filter(item => !dateEndTime || new Date(item.date_create).getTime() < dateEndTime)
        const result = {}
        Array.from(new Set( //http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            current.map(item => item.user_id)))
            .forEach(userId => {
                const sum = current
                    .filter(item => item.user_id == userId)
                    .reduce((acc, val) => {
                        if (isNaN(val.value))
                            return acc
                        return acc + val.value
                    }, 0)
                result[userId] = sum
            })
        return result
    }

    // Траты по категориям / средние траты за %период%
    _getCategoriesSums(all = [], dateStart = new Date(), dateEnd = new Date(), userId = null) {
        const dateStartTime = dateStart.getTime()
        const dateEndTime = dateEnd.getTime()

        const current = all //filter
            .filter(item => !dateStartTime || new Date(item.date_create).getTime() >= dateStartTime)
            .filter(item => !dateEndTime || new Date(item.date_create).getTime() < dateEndTime)
            .filter(item => !userId || item.user_id == userId)
        const result = {}
        Array.from(new Set( //http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            current.map(item => item.category)))
            .forEach(category => {
                const sum = current
                    .filter(item => item.category == category)
                    .reduce((acc, val) => {
                        if (isNaN(val.value))
                            return acc
                        return acc + val.value
                    }, 0)
                result[category] = sum
            })
        return result
    }
}


