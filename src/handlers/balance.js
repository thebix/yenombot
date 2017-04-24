import { store } from '../server'
import { balanceInit, balanceChange } from '../actions'
import _commands from '../enums/commands'

import { l } from '../logger'

export default class Balance {
    constructor() { }

    change(message, bot) {
        const { text } = message
        const period = new Date().getMonth()
        let balance = store.getState().balance[message.chat.id]
        if (balance && balance.period != period)
            store.dispatch(balanceInit(message.chat.id, period))
        store.dispatch(balanceChange(message.chat.id, period, text))
        balance = store.getState().balance[message.chat.id].balance

        bot.sendMessage(message.chat.id, `Доступный баланс ${balance} 🤖`)
    }
}