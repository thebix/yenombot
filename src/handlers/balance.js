import { Parser } from 'expr-eval'

import _config from '../config'
import { store } from '../server'
import { balanceInit, balanceChange, jsonSave } from '../actions'
import _commands from '../enums/commands'

import { l } from '../logger'

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

        const groups = newState.paymentGroups[message.chat.id]
        if (!groups || groups.length == 0) { //для чата не заданы группы
            return bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
        }

        const remDiv = groups.length % 3
        const rows = parseInt(groups.length / 3)
            + (remDiv ? 1 : 0)

        l('rows.length', rows.length)
        let i = 0
        const buttons = []
        for (i; i < rows; i++) {
            if (i != rows - 1)
                buttons.push(
                    groups.slice(i * 3, i * 3 + 3)
                        .map(() => { this._mapGroupsToButtons() })
                )
            else
                buttons.push(
                    groups.slice(i * 3, i * 3 + remDiv)
                        .map(this._mapGroupsToButtons)
                )
        }
        l('rows', rows)

        // bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
        bot.sendMessage(message.chat.id, `Выбери категорию 🤖`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: `Категория 1`,
                            callback_data: `help/sub1`
                        }, {
                            text: `Категория 2`,
                            callback_data: `help/sub2`
                        }
                    ],
                    [{
                        text: `Категория 3`,
                        callback_data: `help/sub3`
                    }]
                ]
            })
        })
        return
    }
    balanceChange(message, bot) {
        l('balanceChange')
    }
    _mapGroupsToButtons(id, group) {
        return {
            text: group.title,
            callback_data: JSON.stringify({
                id, group
            })
        }
        // l('group', group)
    }
}