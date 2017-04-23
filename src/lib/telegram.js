import TelegramBot from 'node-telegram-bot-api'
import _token from '../token'
import _config from '../config'

import Message from './message'
import InputParser from './InputParser'
import handlers from '../handlers/index'

import { l } from '../logger'

const inputParser = new InputParser()

export default class Telegram {
    //token - если не передан, берется из token.js
    constructor(token) {
        const t = token ? token : _config.isProduction ? _token.botToken.prod : _token.botToken.dev
        this._bot = new TelegramBot(t, { polling: true })
        this._handleText = this._handleText.bind(this)
    }
    listen() {
        this._bot.on('text', this._handleText)
        return new Promise(() => { }) //TODO: разобраться зачем
    }
    _handleText(msg) {
        const message = new Message(Message.mapMessage(msg)) //TODO: нафига это надо?
        const text = message.text

        if (inputParser.isAskingForEcho(text))
            return handlers.misc.getEcho(message, this._bot)

        // if (inputParser.isAskingForGenreList(text))
        //     return handlers.music.getGenreList(message, this._bot)

        // if (inputParser.isAskingForNumberOfRec(text, store.getState(message.from).command))
        //     return handlers.music.getNumOfRec(message, this._bot)

        // default
        return handlers.casual.getHelp(message, this._bot)
    }


}
