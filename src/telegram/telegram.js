import TelegramBot from 'node-telegram-bot-api'
import _token from '../token'
import _config from '../config'
import _commands from '../enums/commands'

import Message from './message'
import InputParser from './InputParser'
import handlers from '../handlers/index'

import { log, logLevel } from '../logger'
import { store } from '../server'
import { userAdd } from '../actions'

const inputParser = new InputParser()

export default class Telegram { // extends TelegramBot
    // token - если не передан, берется из token.js
    constructor(token) {
        const t = token || _config.isProduction ? _token.botToken.prod : _token.botToken.dev
        this.bot = new TelegramBot(t, { polling: true })
        this.handleText = this.handleText.bind(this)
        this.handleCallback = this.handleCallback.bind(this)
    }
    listen() {
        this.bot.on('text', this.handleText)
        this.bot.on('callback_query', this.handleCallback);
        // return new Promise(() => { }) //TODO: разобраться зачем
    }
    // INFO: message должен быть соствлен очень внимательно
    trigger(cmd = _commands.HELP, message, options = {}) {
        switch (cmd) {
            case _commands.BALANCE_STATS:
                return handlers.balance.stats(message, this.bot, options.noBalance)
            case _commands.BALANCE_REPORT:
                return handlers.balance.report(message, this.bot, options.noBalance)
            default:
                log(`Необработанная команда '${cmd}' боту при вызове Telegram.trigger().`, logLevel.ERROR)
        }
        throw new Error(`Необработанная команда '${cmd}' боту при вызове Telegram.trigger().`)
    }
    handleText(msg) {
        const message = new Message(Message.mapMessage(msg))
        const { text } = message

        const state = store.getState()
        const prevCommand = state.command[message.chat.id]

        if (state && state.users && !state.users[message.user.id]) {
            store.dispatch(userAdd(message.user))
        }

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.from)) {
                return handlers.auth.getNeedDevStatus(message, this.bot)
            }
        }

        if (inputParser.isAskingForStart(text))
            return handlers.balance.initIfNeed(message, this.bot)
        // if (inputParser.isAskingForHelp(text))
        //     return handlers.help.getHelp(message, this.bot)
        if (inputParser.isAskingForInitToken(text))
            return handlers.init.initByToken(message, this.bot)
        if (inputParser.isAskingForReport(text))
            return handlers.balance.report(message, this.bot)
        if (inputParser.isAskingForStats(text)) {
            return handlers.balance.stats(message, this.bot)
        }
        if (inputParser.isAskingForBalance(text))
            return handlers.balance.balance(message, this.bot)
        if (inputParser.isAskingForBalanceInit(text))
            return handlers.balance.init(message, this.bot)
        if (inputParser.isAskingForBalanceChange(text))
            return handlers.balance.change(message, this.bot)
        if (inputParser.isAskingForCommentChange(text, prevCommand))
            return handlers.balance.commentChange(message, this.bot)
        if (inputParser.isAskingForEcho(text))
            return handlers.misc.getEcho(message, this.bot)

        // default
        return handlers.help.getHelp(message, this.bot, prevCommand)
    }
    handleCallback(callbackQuery) {
        let { data } = callbackQuery
        data = data ? JSON.parse(data) : {}
        const message = new Message(Message.mapMessage(callbackQuery.message))
        const state = store.getState()
        const prevCommand = state.command[message.chat.id]

        if (!_config.isProduction) {
            if (!inputParser.isDeveloper(message.chat.id)) {
                this.bot.answerCallbackQuery(callbackQuery.id, 'No dev access', false);
                return handlers.auth.getNeedDevStatus(message, this.bot)
            }
        }

        // default
        this.bot.answerCallbackQuery(callbackQuery.id, 'Команда получена', false);

        if (inputParser.isAskingForCategoryChange(message, prevCommand, data)) {
            return handlers.balance.categoryChange(message, this.bot, data)
        }
        if (inputParser.isAskingForBalanceDelete(message, prevCommand, data)) {
            return handlers.balance.delete(message, this.bot, data)
        }

        return handlers.help.getHelp(message, this.bot, data)
    }
}
