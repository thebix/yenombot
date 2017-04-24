import { store } from '../server'
import { balanceChange } from '../actions'
import _commands from '../enums/commands'

import { l } from '../logger'

export default class Balance {
    constructor() { }

    change(message, bot) {
        const { text } = message
        store.dispatch(balanceChange(message.chat.id, text))
        l('store', store.getState())
        const balance = store.getState().balance[message.chat.id] || 0

        bot.sendMessage(message.chat.id, `Доступный баланс ${balance} 🤖`)
    }
}