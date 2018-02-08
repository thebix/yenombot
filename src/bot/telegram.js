import TelegramBot from 'node-telegram-bot-api'
import { Observable } from 'rxjs'
import { log, logLevel } from '../logger'
import UserMessage, { UserAction } from './message'

const botMessageOptions = (
    inlineButtonsGroups = undefined,
    replyKeyboard = undefined,
    editMessageId = undefined,
    editMessageChatId = undefined
) => {
    const options = {
        message_id: editMessageId,
        chat_id: editMessageChatId,
        reply_markup: {}
    }
    if (inlineButtonsGroups && Array.isArray(inlineButtonsGroups)) {
        options.reply_markup.inline_keyboard =
            inlineButtonsGroups.map(inlineButtonsGroup =>
                inlineButtonsGroup.inlineButtons
                    .map(inlineButton => ({
                        text: inlineButton.text,
                        callback_data: JSON.stringify(inlineButton.callbackData)
                    }))
            )
    }
    if (replyKeyboard && replyKeyboard.buttons && Array.isArray(replyKeyboard.buttons)) {
        const {
            buttons = [],
            resizeKeyboard = false,
            oneTimeKeyboard = false,
            selective = false } = replyKeyboard

        options.reply_markup.resize_keyboard = resizeKeyboard
        options.reply_markup.one_time_keyboard = oneTimeKeyboard
        options.reply_markup.selective = selective
        options.reply_markup.keyboard =
            buttons.map(item => [{
                text: item.text
            }])
    }
    return options
}

export default class Telegram {
    constructor(token) {
        if (!token) {
            log('Telegram: You should provide a telegram bot token', logLevel.ERROR)
            return
        }
        this.bot = new TelegramBot(token, { polling: true })
    }
    userText() {
        return Observable.fromEvent(this.bot, 'text')
            .map(msg => UserMessage.mapTelegramMessage(msg))
    }
    userActions() {
        return Observable.fromEvent(this.bot, 'callback_query')
            .do(userAction => this.bot.answerCallbackQuery(userAction.id, 'Команда получена', false))
            .map(userAction => UserAction.mapTelegramUserAction(userAction))
    }
    botMessage({ chatId, text, inlineButtonsGroups, replyKeyboard }) {
        // TODO: check if bot has access to chatId
        return Observable.fromPromise(this.bot.sendMessage(chatId, `${text} 🤖`,
            botMessageOptions(inlineButtonsGroups, replyKeyboard)))
    }
    botMessageEdit({ chatId, text, inlineButtonsGroups, messageIdToEdit }) {
        // TODO: check if bot has access to chatId
        return Observable.fromPromise(this.bot.editMessageText(`${text} 🤖`,
            botMessageOptions(inlineButtonsGroups, undefined, messageIdToEdit, chatId)))
    }
}
