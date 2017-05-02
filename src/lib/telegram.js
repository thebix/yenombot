import TelegramBot from 'node-telegram-bot-api'
import _token from '../token'
import _config from '../config'

import Message from './message'
import InputParser from './InputParser'
import handlers from '../handlers/index'

import { l } from '../logger'
import { store } from '../server'
import { userAdd } from '../actions'

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
        //return new Promise(() => { }) //TODO: разобраться зачем
        return
    }
    _handleText(msg) {
        const message = new Message(Message.mapMessage(msg))
        const { text } = message

        const state = store.getState()
        const prevCommand = state.command[message.chat.id]

        if (state && state.users && !state.users[message.user.id]) {
            store.dispatch(userAdd(message.user))
        }

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.from)) {
                return handlers.auth.getNeedDevStatus(message, this._bot)
            }
        }

        if (inputParser.isAskingForStart(text)) {
            return handlers.balance.initIfNeed(message, this._bot)
        }
        // if (inputParser.isAskingForHelp(text))
        //     return handlers.help.getHelp(message, this._bot)
        if (inputParser.isAskingForInitToken(text)) {
            return handlers.init.initByToken(message, this._bot)
        }
        if (inputParser.isAskingForReport(text)) {
            return handlers.balance.report(message, this._bot)
        }
        if (inputParser.isAskingForBalance(text))
            return handlers.balance.balance(message, this._bot)
        if (inputParser.isAskingForBalanceInit(text))
            return handlers.balance.init(message, this._bot)
        if (inputParser.isAskingForBalanceChange(text))
            return handlers.balance.change(message, this._bot)
        if (inputParser.isAskingForCommentChange(text, prevCommand))
            return handlers.balance.commentChange(message, this._bot)
        if (inputParser.isAskingForEcho(text))
            return handlers.misc.getEcho(message, this._bot)

        // default
        return handlers.help.getHelp(message, this._bot, prevCommand)
    }
    _handleCallback(callbackQuery) {
        let { data } = callbackQuery
        data = data ? JSON.parse(data) : {}
        const message = new Message(Message.mapMessage(callbackQuery.message))
        const state = store.getState()
        const prevCommand = state.command[message.chat.id]

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.chat.id)) {
                this._bot.answerCallbackQuery(callbackQuery.id, "No dev access", false);
                return handlers.auth.getNeedDevStatus(message, this._bot)
            }
        }

        // default
        this._bot.answerCallbackQuery(callbackQuery.id, 'Команда получена', false);

        if (inputParser.isAskingForCategoryChange(message, prevCommand, data)) {
            return handlers.balance.categoryChange(message, this._bot, data)
        }
        if (inputParser.isAskingForBalanceDelete(message, prevCommand, data)) {
            return handlers.balance.delete(message, this._bot, data)
        }


        return handlers.help.getHelp(message, this._bot, data)
    }


}
