import { Parser } from 'expr-eval'

import _config from '../config'
import { store } from '../server'
import { balanceInit, balanceChange, jsonSave } from '../actions'
import _commands from '../enums/commands'
import FileSystem from '../filesystem'

import { l, log } from '../logger'

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

        //сохранение истории
        const file = `${_config.dirStorage}balance-hist-${message.chat.id}.json`
        if (FileSystem.isFileExists(file, true, null, '[]')) {
            FileSystem.readJson(file)
                .then((data) => {

                    const history = data || []
                    history.push({
                        'date_create': new Date(),
                        'date_edit': new Date(),
                        'date_delete': null,
                        'category': 'no-category',
                        'value': text,
                        'user_id': message.from
                    })
                    FileSystem.saveJson(file, history)
                        .then(data => { })
                        .catch(err => {
                            log(`Ошибка сохранения файла исатории баланса. err = ${err}. file = ${file}`)
                        })
                })
                .catch(err => {
                    log(`Ошибка чтения файла исатории баланса. err = ${err}. file = ${file}`)
                })
        }

        bot.sendMessage(message.chat.id, `Остаток ${balance} 🤖`)
    }
}