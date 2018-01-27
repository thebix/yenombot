/*
 * INFO:
 *      - every handler should return Observable.from([BotMessage])
 */

import { Observable } from 'rxjs/Observable'
import { Parser } from 'expr-eval'

import { BotMessage, InlineButton, BotMessageEdit } from './message'
import commands from './commands'
import storage from '../storage'
import { log, logLevel } from '../logger'
import token from '../token'
import InputParser from './inputParser'
import config from '../config'
import history, { HistoryItem } from '../history/history'

const lastCommands = {}

/*
 * ERRORS HANDERS
 */
const errorToUser = (userId, chatId) => [new BotMessage(userId, chatId,
    'При при обработке запроса произошла ошибка. Пожалуйста, начните заново')]

const botIsInDevelopmentToUser = (userId, chatId) => {
    log(`handlers.botIsInDevelopmentToUser: userId="${userId}" is not in token.developers array.`, logLevel.ERROR)
    return Observable.from([new BotMessage(userId, chatId,
        `В данный момент бот находится в режиме разработки. \nВаш идентификатор в мессенджере - "${userId}". Сообщите свой идентификатор по контактам в описании бота, чтобы Вас добавили в группу разработчиков`)])
}

/*
 * COMMON METHODS
 */
export const dateTimeString = (date = new Date()) => new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Moscow'
}).format(date)

const storageId = (userId, chatId) => `${chatId}`
const initializeBalanceObservable = (userId, chatId) =>
    storage.getItem(storageId(userId, chatId), 'balanceInit')
        .switchMap(balanceInitValue => {
            const balanceObject = {
                balance: balanceInitValue || 0,
                period: new Date().getMonth()
            }
            return storage.updateItem(storageId(userId, chatId), 'balance', balanceObject)
                .map(isBalanceObjectUpdated => {
                    return isBalanceObjectUpdated === true
                        ? balanceObject
                        : null
                })
        })
const getBalanceObservable = (userId, chatId) =>
    storage.getItem(storageId(userId, chatId), 'balance')
        .switchMap(balanceObject => {
            if (balanceObject === false)
                return Observable.of(null)
            const period = new Date().getMonth()
            if (balanceObject === undefined || balanceObject === null || balanceObject === ''
                || period !== balanceObject.period) {
                return initializeBalanceObservable(userId, chatId)
            }
            return Observable.of(balanceObject)
        })
const getCategoriesObservable = (userId, chatId) =>
    storage.getItem(storageId(userId, chatId), 'paymentGroups')
        .map(categoriesArray => {
            if (categoriesArray === false)
                log('//TODO: proper log message: cant fetch categories', logLevel.ERROR)

            return categoriesArray || []
        })
/*
 * HANDLERS
 */
/*
 * USER MESSAGE HELPERS
 */
const start = (userId, chatId) => Observable.from([new BotMessage(userId, chatId,
    'Вас приветствует yenomBot!')])

const help = (userId, chatId) => Observable.from([new BotMessage(userId, chatId,
    'Помощь\nЗдесь Вы можете узнать актуальную информацию о своих деньгах.')])

const tokenInit = (userId, chatId, text) => {
    const tokenKey = text.split(' ')[1]
    if (Object.keys(token.initData).indexOf(tokenKey) === -1)
        return Observable.from([new BotMessage(userId, chatId, 'Токен не найден')])

    const initDataItems = token.initData[tokenKey]
    const dataItems = Object.keys(initDataItems)
        .map(key => {
            return {
                fieldName: key,
                item: initDataItems[key]
            }
        })
    return storage.updateItems(storageId(userId, chatId), dataItems)
        .mergeMap(isStorageUpdated => {
            return !isStorageUpdated
                ? Observable.from(errorToUser(userId, chatId))
                : Observable.from([new BotMessage(userId, chatId, 'Токен принят')])
        })
}

const balance = (userId, chatId) =>
    getBalanceObservable(userId, chatId)
        .switchMap(balanceObject => {
            if (!balanceObject) {
                return Observable.from(errorToUser(userId, chatId))
            }
            return Observable.from([new BotMessage(userId, chatId, `Остаток ${balanceObject.balance}`)])
        })

const balanceInit = (userId, chatId) =>
    initializeBalanceObservable(userId, chatId)
        .switchMap(() => balance(userId, chatId))

const balanceChange = (userId, chatId, text, messageId) => {
    const parser = new Parser()
    let value
    try {
        value = parser.parse(text).evaluate()
        if (!value)
            return Observable.from([new BotMessage(userId, chatId, 'Не понял выражение')])
        if (value === Infinity)
            return Observable.from([new BotMessage(userId, chatId,
                'Я открою тебе маленькую тайну http://elementy.ru/email/1530320/Pochemu_nelzya_delit_na_nol')])
    } catch (ex) {
        return Observable.from([new BotMessage(userId, chatId, 'Не понял выражение')])
    }

    const newBalanceObservable = getBalanceObservable(userId, chatId)
        .switchMap(balanceObject => {
            if (!balanceObject) {
                return Observable.from(errorToUser(userId, chatId))
            }
            const { balance: balanceValue } = balanceObject
            const newBalanceObject = Object.assign({}, balanceObject, { balance: balanceValue - value })
            return storage.updateItem(storageId(userId, chatId), 'balance', newBalanceObject)
                .map(isBalanceUpdated => {
                    return isBalanceUpdated
                        ? newBalanceObject
                        : null
                })
        }).share()

    const balanceUpdateError = newBalanceObservable
        .filter(newBalanceObject => !newBalanceObject)
        .switchMap(() => {
            log(`handlers:balanceChange: can't update balance. userId:<${userId}>, chatId:<${chatId}>, text:<${text}>, messageId:<${messageId}>`,
                logLevel.ERROR)
            return [new BotMessage(userId, chatId, 'При обновлении баланса возникла ошибка')]
        })

    const historySaveObservable = newBalanceObservable
        .filter(newBalanceObject => !!newBalanceObject)
        .switchMap(newBalanceObject =>
            history.add(new HistoryItem(messageId, userId, value),
                chatId)
                .map(isHistorySaved => {
                    return isHistorySaved
                        ? newBalanceObject
                        : null
                })).share()

    const historySaveError = historySaveObservable
        .filter(isHistorySaved => !isHistorySaved)
        .switchMap(() => {
            log(`handlers:balanceChange: can't save history item. userId:<${userId}>, chatId:<${chatId}>, text:<${text}>, messageId:<${messageId}>`,
                logLevel.ERROR)
            return [new BotMessage(userId, chatId, 'При обновлении истории возникла ошибка')]
        })

    const successObservable =
        Observable.combineLatest(
            getCategoriesObservable(userId, chatId),
            historySaveObservable
                .filter(isHistorySaved => !!isHistorySaved),
            (categories, newBalanceObject) => {
                // TODO: button groups
                // const cols = 3 // кол-во в блоке
                // const buttons = [] // результат
                // const blocksCount = parseInt(categories.length / cols, 10)
                //     + ((categories.length % cols) > 0 ? 1 : 0)
                // for (let i = 0; i < blocksCount; i += 1) {
                //     buttons.push(
                //         categories.slice(i * cols, cols * (i + 1))
                //             .map(category => {
                //                 const { id, title } = category
                //                 return new InlineButton(title, {
                //                     gId: id,
                //                     hId: messageId,
                //                     cmd: commands.BALANCE_CATEGORY_CHANGE
                //                 })
                //             })
                //     )
                // }
                const buttons = categories
                    .map(category => {
                        const { id, title } = category
                        return new InlineButton(title, {
                            gId: id,
                            hId: messageId,
                            cmd: commands.BALANCE_CATEGORY_CHANGE
                        })
                    })
                lastCommands[storageId(userId, chatId)] = commands.BALANCE_CHANGE
                return Observable.from([new BotMessage(userId, chatId, `Записал ${value}. Выбери категорию`, buttons)]) //
                    .concat(balance(userId, chatId))
            })
            .concatMap(item => item)
    return Observable.merge(balanceUpdateError, historySaveError, successObservable)
}

const commentChange = (userId, chatId, text) => {
    // сохранение комментария
    const historyAllObservable = history.getAll(chatId).share()
    const historyAllError = historyAllObservable
        .filter(historyAll => !historyAll || historyAll.length === 0)
        .switchMap(() => {
            log(`handlers:commentChange: can't fetch history items. userId:<${userId}>, chatId:<${chatId}`, logLevel.ERROR)
            return errorToUser(userId, chatId)
        })

    const historyUpdateObservable =
        historyAllObservable
            .filter(historyAll => historyAll && historyAll.length !== 0)
            .switchMap(historyAll => {
                const historyLastId = Math.max(...historyAll.map(historyItem => historyItem.id))
                return history.update(historyLastId, { comment: text }, chatId)
            }).share()

    const historyUpdateError =
        historyUpdateObservable
            .filter(updatedHistoryItem => !updatedHistoryItem)
            .switchMap(() => {
                log(`handlers:commentChange: can't update last history item. userId:<${userId}>, chatId:<${chatId}`, logLevel.ERROR)
                return errorToUser(userId, chatId)
            })

    const successObservable =
        historyUpdateObservable
            .filter(updatedHistoryItem => !!updatedHistoryItem)
            .map(updatedHistoryItem => {
                lastCommands[storageId(userId, chatId)] = undefined
                return new BotMessageEdit(updatedHistoryItem.id, chatId,
                    `${updatedHistoryItem.value}, ${updatedHistoryItem.category}, ${updatedHistoryItem.comment}`,
                    [new InlineButton('Удалить', { hId: updatedHistoryItem.id, cmd: commands.BALANCE_REMOVE })])
            })
            .concat(balance(userId, chatId))

    return Observable.merge(historyAllError, historyUpdateError, successObservable)
}

/*
 * USER ACTION HELPERS
 */
const categoryChange = (userId, chatId, data, messageId) => {
    // сохранение категории
    const { hId, gId } = data

    const historyUpdateObservable = getCategoriesObservable(userId, chatId)
        .switchMap(categories => {
            if (!categories || categories.length === 0)
                return errorToUser(userId, chatId)
            return history.update(hId, {
                category: categories.filter(category => gId === category.id)[0].title
            }, chatId)
        })
        .share()

    const historyUpdateError =
        historyUpdateObservable
            .filter(updatedHistoryItem => !updatedHistoryItem)
            .switchMap(() => {
                log(`handlers:categoryChange: can't update history item. hId:<${hId}>, gId:<${gId}`, logLevel.ERROR)
                return errorToUser(userId, chatId)
            })

    const successObservable =
        historyUpdateObservable
            .filter(updatedHistoryItem => !!updatedHistoryItem)
            .map(updatedHistoryItem => {
                lastCommands[storageId(userId, chatId)] = commands.BALANCE_CATEGORY_CHANGE
                return new BotMessageEdit(messageId, chatId, `${updatedHistoryItem.value}, ${updatedHistoryItem.category}`,
                    [new InlineButton('Удалить', { hId, cmd: commands.BALANCE_REMOVE })])
            })
    return Observable.merge(historyUpdateError, successObservable)
}

const balanceDelete = (userId, chatId, data, messageId) => {
    // удаление записи
    const { hId } = data

    const historyUpdateObservable =
        history.update(hId, {
            date_delete: new Date()
        }, chatId)
            .share()

    const historyUpdateError =
        historyUpdateObservable
            .filter(updatedHistoryItem => !updatedHistoryItem)
            .switchMap(() => {
                log(`handlers:balanceDelete: can't delete history item. hId:<${hId}>, chatId:<${chatId}, messageId:<${messageId}>`, logLevel.ERROR)
                return errorToUser(userId, chatId)
            })

    const successObservable = Observable.combineLatest(
        historyUpdateObservable
            .filter(updatedHistoryItem => !!updatedHistoryItem),
        getBalanceObservable(userId, chatId),
        (updatedHistoryItem, balanceObject) => {
            const dateCreated = new Date(updatedHistoryItem.date_create)
            const currentDate = new Date()
            if (currentDate.getFullYear() === dateCreated.getFullYear()
                && currentDate.getMonth() === dateCreated.getMonth()) {
                const { balance: balanceValue } = balanceObject
                const newBalanceObject = Object.assign({}, balanceObject, { balance: balanceValue + updatedHistoryItem.value })
                return storage.updateItem(storageId(userId, chatId), 'balance', newBalanceObject)
                    .switchMap(isBalanceUpdated => {
                        if (!isBalanceUpdated) {
                            log(`handlers:balanceDelete: can't update storage item. hId:<${hId}>, chatId:<${chatId}, messageId:<${messageId}>`,
                                logLevel.ERROR)
                            return errorToUser(userId, chatId)
                        }
                        return Observable.from([
                            new BotMessageEdit(messageId, chatId,
                                `${updatedHistoryItem.value}, ${updatedHistoryItem.category}, ${updatedHistoryItem.comment} удалено из истории`)])
                            .concat(balance(userId, chatId))
                    })
            }
            return Observable.from([
                new BotMessageEdit(messageId, chatId,
                    `${updatedHistoryItem.value}, ${updatedHistoryItem.category}, ${updatedHistoryItem.comment} удалено из истории`)])
                .concat(balance(userId, chatId))
        })
        .concatMap(item => item)
    return Observable.merge(historyUpdateError, successObservable)
}

/*
 * EXPORTS
 */
const mapMessageToHandler = message => { // eslint-disable-line complexity
    const { text, from, chat, id } = message
    const chatId = chat ? chat.id : from

    let messagesToUser
    if (!config.isProduction && !InputParser.isDeveloper(from)) {
        messagesToUser = botIsInDevelopmentToUser(from, chatId)
    } else if (InputParser.isStart(text)) {
        messagesToUser = start(from, chatId)
    } else if (InputParser.isHelp(text))
        messagesToUser = help(from, chatId)
    else if (InputParser.isToken(text))
        messagesToUser = tokenInit(from, chatId, text)
    else if (InputParser.isBalanceInit(text))
        messagesToUser = balanceInit(from, chatId)
    else if (InputParser.isBalance(text))
        messagesToUser = balance(from, chatId)
    else if (InputParser.isBalanceChange(text))
        messagesToUser = balanceChange(from, chatId, text, id)
    else if (InputParser.isCommentChange(lastCommands[storageId(from, chatId)]))
        messagesToUser = commentChange(from, chatId, text, id)

    if (!messagesToUser) {
        messagesToUser = help(from, chatId)
    }

    return Observable.from(messagesToUser)
        .concatMap(msgToUser => {
            return Observable.of(msgToUser).delay(10)
        })
}

export const mapUserActionToHandler = userAction => { // eslint-disable-line complexity
    const { message, data = {} } = userAction
    const { from, chat, id } = message
    const chatId = chat ? chat.id : from
    const callbackCommand = data.cmd || undefined
    let messagesToUser
    if (InputParser.isCategoryChange(callbackCommand))
        messagesToUser = categoryChange(from, chatId, data, id)
    else if (InputParser.isBalanceDelete(callbackCommand))
        messagesToUser = balanceDelete(from, chatId, data, id)
    else {
        log(`handlers.mapUserActionToHandler: can't find handler for user action callback query. userId=${from}, chatId=${chatId}, data=${JSON.stringify(data)}`,
            logLevel.ERROR)
        messagesToUser = errorToUser(from, chatId)
    }

    return Observable.from(messagesToUser)
        .concatMap(msgToUser => {
            return Observable.of(msgToUser).delay(10)
        })
}

export default mapMessageToHandler
