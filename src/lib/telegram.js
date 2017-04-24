import TelegramBot from 'node-telegram-bot-api'
import _token from '../token'
import _config from '../config'

import Message from './message'
import InputParser from './InputParser'
import handlers from '../handlers/index'

import { l } from '../logger'
import { store } from '../server'

const inputParser = new InputParser()

export default class Telegram {
    //token - если не передан, берется из token.js
    constructor(token) {
        const t = token ? token : _config.isProduction ? _token.botToken.prod : _token.botToken.dev
        this._bot = new TelegramBot(t, { polling: true })
        this._handleText = this._handleText.bind(this)
        this._handleCallback = this._handleCallback.bind(this)
    }
    listen() {
        this._bot.on('text', this._handleText)
        this._bot.on('callback_query', this._handleCallback);
        return new Promise(() => { }) //TODO: разобраться зачем
    }
    _handleText(msg) {
        const message = new Message(Message.mapMessage(msg))
        const { text } = message

        const prevCommand = store.getState().command[message.chat.id]

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.from)) {
                return handlers.auth.getNeedDevStatus(message, this._bot)
            }
        }

        if (inputParser.isAskingForHelp(text))
            return handlers.help.getHelp(message, this._bot)
        if (inputParser.isAskingForBalanceChange(text))
            return handlers.balance.change(message, this._bot)
        if (inputParser.isAskingForEcho(text))
            return handlers.misc.getEcho(message, this._bot)

        // if (inputParser.isAskingForGenreList(text))
        //     return handlers.music.getGenreList(message, this._bot)

        // if (inputParser.isAskingForNumberOfRec(text, store.getState(message.from).command))
        //     return handlers.music.getNumOfRec(message, this._bot)

        // default
        return handlers.help.getHelp(message, this._bot, prevCommand)
    }
    _handleCallback(callbackQuery) {
        const { data } = callbackQuery
        const message = new Message(Message.mapMessage(callbackQuery.message))
        const prevCommand = store.getState().command[message.chat.id]

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.chat.id)) {
                this._bot.answerCallbackQuery(callbackQuery.id, "No dev access", false);
                return handlers.auth.getNeedDevStatus(message, this._bot)
            }
        }

        // default
        this._bot.answerCallbackQuery(callbackQuery.id, "Help", false);
        return handlers.help.getHelp(message, this._bot, data)
    }


}