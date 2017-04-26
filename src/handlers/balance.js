import { Parser } from 'expr-eval'

import _config from '../config'
import { store } from '../server'
import { balanceInit, balanceChange, jsonSave } from '../actions'
import _commands from '../enums/commands'

import { l } from '../logger'

export default class Balance {
    constructor() { }

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

        bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
    }
}