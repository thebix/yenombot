import { store } from '../server'
import _token from '../token'
import _config from '../config'

import {
    jsonSave,
    initByToken
} from '../actions'

export default class Init {
    initByToken(message, bot) {
        const token = message.text.split(' ')[1]
        if (Object.keys(_token.initData).indexOf(token) === -1)
            return bot.sendMessage(message.chat.id, 'Токен не найден 🤖')
        store.dispatch(initByToken(message.chat.id, token))

        const newState = store.getState()
        store.dispatch(jsonSave(_config.fileState, newState))

        return bot.sendMessage(message.chat.id, 'Токен принят 🤖')
    }
}
