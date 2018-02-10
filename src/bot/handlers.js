/*
 * INFO:
 *      - every handler should return Observable.from([BotMessage])
 */

import { Observable } from 'rxjs/Observable'
import { Parser } from 'expr-eval'

import { BotMessage, InlineButton, BotMessageEdit, InlineButtonsGroup } from './message'
import commands from './commands'
import storage from '../storage'
import { log, logLevel } from '../logger'
import token from '../token'
import InputParser from './inputParser'
import config from '../config'
import history, { HistoryItem } from '../history/history'
import lib from '../lib/root'

const lastCommands = {}
const lastChangeBalanceBotMessageId = {}

/*
 * ERRORS HANDERS
 */
const errorToUser = (userId, chatId) => [new BotMessage(userId, chatId,
    'При при обработке запроса произошла ошибка. Пожалуйста, начните заново')]

const botIsInDevelopmentToUser = (userId, chatId) => {
    log(`handlers.botIsInDevelopmentToUser: userId="${userId}" is not in token.developers array.`, logLevel.ERROR)
    return Observable.from([new BotMessage(userId, chatId,
        `В данный момент бот находится в режиме разработки. \nВаш идентификатор в мессенджере - "${userId}". Сообщите свой идентификатор по контактам в описании бота, чтобы Вас добавили в группу разработчиков`)]) // eslint-disable-line max-len
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
                .map(isBalanceObjectUpdated => (
                    isBalanceObjectUpdated === true
                        ? balanceObject
                        : null))
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
                log(`handlers:getCategoriesObservable: can't fetch categories. userId:<${userId}>, chatId:<${chatId}>`,
                    logLevel.ERROR)
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
        .map(key => ({
            fieldName: key,
            item: initDataItems[key]
        }))
    return storage.updateItems(storageId(userId, chatId), dataItems)
        .mergeMap(isStorageUpdated => (
            !isStorageUpdated
                ? Observable.from(errorToUser(userId, chatId))
                : Observable.from([new BotMessage(userId, chatId, 'Токен принят')])
        ))
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

const balanceChange = (user, chatId, text, messageId) => {
    const { id: userId, firstName, lastName } = user
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

    // TODO: this error should prevent further observables from emitting
    const addUserToStorageError = storage.getItem(storageId(userId, chatId), 'balanceUsers')
        .concatMap(balanceUsers => {
            let balanceUsersUpdated = {}
            if (balanceUsers) {
                balanceUsersUpdated = balanceUsers
            }
            if (!balanceUsersUpdated[userId]) {
                balanceUsersUpdated[userId] = `${firstName || ''} ${lastName || ''}`
                return storage.updateItem(storageId(userId, chatId), 'balanceUsers', balanceUsersUpdated)
                    .switchMap(updateResult => (updateResult
                        ? Observable.empty()
                        : Observable.from(errorToUser(userId, chatId))
                    ))
            }
            return Observable.empty()
        })

    const newBalanceObservable = getBalanceObservable(userId, chatId)
        .switchMap(balanceObject => {
            if (!balanceObject) {
                return Observable.from(errorToUser(userId, chatId))
            }
            const { balance: balanceValue } = balanceObject
            const newBalanceObject = Object.assign({}, balanceObject, { balance: balanceValue - value })
            return storage.updateItem(storageId(userId, chatId), 'balance', newBalanceObject)
                .map(isBalanceUpdated => (isBalanceUpdated
                    ? newBalanceObject
                    : null
                ))
        }).share()

    const balanceUpdateError = newBalanceObservable
        .filter(newBalanceObject => !newBalanceObject)
        .switchMap(() => {
            log(`handlers: balanceChange: can't update balance. userId:<${userId}>, chatId:<${chatId}>, text:<${text}>, messageId:<${messageId}>`,
                logLevel.ERROR)
            return [new BotMessage(userId, chatId, 'При обновлении баланса возникла ошибка')]
        })

    const historySaveObservable = newBalanceObservable
        .filter(newBalanceObject => !!newBalanceObject)
        .switchMap(newBalanceObject =>
            history.add(new HistoryItem(messageId, userId, value),
                chatId)
                .map(isHistorySaved => (isHistorySaved
                    ? newBalanceObject
                    : null
                ))).share()

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
            categories => {
                const cols = 3 // count in horizontal block
                const buttonsGroups = [new InlineButtonsGroup(
                    [new InlineButton('Удалить', {
                        hId: messageId,
                        cmd: commands.BALANCE_REMOVE
                    })]
                )]
                const blocksCount = parseInt(categories.length / cols, 10)
                    + ((categories.length % cols) > 0 ? 1 : 0)
                for (let i = 0; i < blocksCount; i += 1) {
                    buttonsGroups.push(
                        new InlineButtonsGroup(
                            categories.slice(i * cols, cols * (i + 1))
                                .map(category => {
                                    const { id, title } = category
                                    return new InlineButton(title, {
                                        gId: id,
                                        hId: messageId,
                                        cmd: commands.BALANCE_CATEGORY_CHANGE
                                    })
                                })
                        )
                    )
                }
                lastCommands[storageId(userId, chatId)] = commands.BALANCE_CHANGE
                return Observable.from([new BotMessage(userId, chatId, `Записал ${value}. Выбери категорию`, buttonsGroups)])
                    .concat(balance(userId, chatId))
            })
            .concatMap(item => item.delay(10))
    return Observable.merge(addUserToStorageError, balanceUpdateError, historySaveError, successObservable)
}

const commentChange = (userId, chatId, text) => {
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
            .switchMap(updatedHistoryItem => {
                lastCommands[storageId(userId, chatId)] = undefined
                const editMessageId = lastChangeBalanceBotMessageId[storageId(userId, chatId)]
                if (!editMessageId) {
                    return Observable.empty()
                }
                return Observable.of(new BotMessageEdit(editMessageId, chatId,
                    `${updatedHistoryItem.value}, ${updatedHistoryItem.category}, ${updatedHistoryItem.comment}`,
                    [new InlineButtonsGroup([new InlineButton('Удалить', { hId: updatedHistoryItem.id, cmd: commands.BALANCE_REMOVE })])])
                )
            })
            .concat(balance(userId, chatId))

    return Observable.merge(historyAllError, historyUpdateError, successObservable)
}

const stats = (userId, chatId, text) => {
    // getting the interval
    let dateEnd,
        dateStart,
        dateEndUser
    const split = (`${text}`).split(' ')
    if (split.length === 1) { // without params => just this month statistics
        dateEnd = lib.time.getEndDate()
        dateStart = lib.time.getMonthStartDate(dateEnd)
        dateEndUser = dateEnd
    } else if (split.length < 3) { // date start - till - current date
        dateEnd = lib.time.getEndDate()
        dateStart = lib.time.getBack(split[1].trim(' '), dateEnd)
        dateEndUser = dateEnd
    } else { // date start - till - date end
        // end day should be added to statistics
        const end = lib.time.getBack(split[2].trim(' ')) // date end (starts from 0:00)
        dateStart = lib.time.getBack(split[1].trim(' '), end)
        dateEnd = lib.time.getEndDate(end)
        if (lib.time.isDateSame(dateStart, dateEnd))
            dateEndUser = dateEnd
        else
            // we are showing to user the date one day less
            dateEndUser = lib.time.getChangedDateTime({ days: -1 }, dateEnd)
    }
    const dateEndTime = dateEnd.getTime()
    const dateStartTime = dateStart.getTime()
    const curTicks = dateEndTime - dateStartTime
    if (curTicks < 1000 * 60 * 60 * 4)
        return Observable.from([new BotMessage(userId, chatId,
            'Слишком короткий интервал. Минимум 4 часа.')])

    const intervalLength = lib.time.daysBetween(dateStart, lib.time.getChangedDateTime({ ticks: 1 }, dateEnd))

    return Observable.combineLatest(
        storage.getItems(storageId(userId, chatId), ['nonUserPaymentGroups', 'balanceUsers']),
        history.getAll(chatId),
        (storageData, historyAll) => {
            const {
                nonUserPaymentGroups: nonUserPaymentCategories,
                balanceUsers
            } = storageData
            return {
                nonUserPaymentCategories,
                historyAll,
                balanceUsers
            }
        }
    ).concatMap(storageData => {
        const { nonUserPaymentCategories = [],
            historyAll = [],
            balanceUsers = {}
        } = storageData
        let periodNumber = 0
        const historyAllSorted = historyAll
            .filter(historyItem => !historyItem.date_delete)
            .sort((i1, i2) => i2.id - i1.id)
        const successMessages = [
            new BotMessage(userId, chatId,
                `Период: ${lib.time.dateWeekdayString(dateStart)} - ${lib.time.dateWeekdayString(dateEndUser)}\nДней: ${lib.time.daysBetween(dateStart, dateEnd)}`) // eslint-disable-line max-len
        ]
        if (historyAllSorted.length === 0) {
            successMessages.push(new BotMessage(userId, chatId, 'Нет записей для отображения'))
            return Observable.from(successMessages)
                .concat(balance(userId, chatId))
        }

        // users in history
        const historyUsers = Array.from(new Set( // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            historyAllSorted.map(item => item.user_id)))
        // categories in history
        const historyCategories = Array.from(new Set( // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            historyAllSorted.map(item => item.category)))
        const userSumsPevPeriods = {}  // summary of all payments by user in previous periods ~~, doesn't unclude current period~~
        historyUsers.forEach(user => {
            userSumsPevPeriods[user] = 0
        })
        nonUserPaymentCategories.forEach(category => {
            userSumsPevPeriods[category] = 0
        })
        const categoriesSumsPevPeriods = {} // summary of all payments by category in previous periods ~~, doesn't unclude current period~~
        historyCategories.forEach(category => {
            categoriesSumsPevPeriods[category] = 0
        })
        nonUserPaymentCategories.forEach(category => {
            categoriesSumsPevPeriods[category] = 0
        })
        const userSumsByPeriods = {} // payments by user by period, including current period
        const categoriesSumsByPeriods = {} // payments by category by period, including current period
        const initCurrentPeriodUsersSums = () => {
            userSumsByPeriods[periodNumber] = {}
            historyUsers.forEach(user => {
                userSumsByPeriods[periodNumber][user] = 0
            })
            nonUserPaymentCategories.forEach(category => {
                userSumsByPeriods[periodNumber][category] = 0
            })
        }
        const initCurrentPeriodCategoriesSums = () => {
            categoriesSumsByPeriods[periodNumber] = {}
            historyCategories.forEach(category => {
                categoriesSumsByPeriods[periodNumber][category] = 0
            })
            nonUserPaymentCategories.forEach(category => {
                categoriesSumsByPeriods[periodNumber][category] = 0
            })
        }
        initCurrentPeriodUsersSums()
        initCurrentPeriodCategoriesSums()
        let curIntervalDateStart = dateStart
        let curIntervalDateEnd = dateEnd

        // get intervals before the last historyItem
        const historyItemLast = historyAllSorted[0]
        let historyItemTicks = new Date(historyItemLast.date_create).getTime()
        while (historyItemTicks < curIntervalDateStart.getTime()) {
            periodNumber += 1
            curIntervalDateStart = lib.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateStart)
            curIntervalDateEnd = lib.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateEnd)
            initCurrentPeriodUsersSums()
            initCurrentPeriodCategoriesSums()
        }
        let i = 0
        for (i; i < historyAllSorted.length; i += 1) {
            const { date_create, value, user_id, category } = historyAllSorted[i]
            historyItemTicks = new Date(date_create).getTime()
            // check if we need to increase period
            while (historyItemTicks < curIntervalDateStart.getTime()) {
                periodNumber += 1
                curIntervalDateStart = lib.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateStart)
                curIntervalDateEnd = lib.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateEnd)
                initCurrentPeriodUsersSums()
                initCurrentPeriodCategoriesSums()
            }
            if (nonUserPaymentCategories.indexOf(category) === -1) {
                userSumsByPeriods[periodNumber][user_id] += value
                userSumsPevPeriods[user_id] += value
            } else {
                userSumsByPeriods[periodNumber][category] += value
                userSumsPevPeriods[category] += value
            }
            categoriesSumsByPeriods[periodNumber][category] += value
            categoriesSumsPevPeriods[category] += value
        }

        const periodsAllCount = Object.keys(userSumsByPeriods).length  // all history periods count
        if (periodsAllCount === 0) {
            successMessages.push(new BotMessage(userId, chatId, 'Нет записей для отображения'))
            return Observable.from(successMessages)
                .concat(balance(userId, chatId))
        }
        const usersInCurrentPeriod =
            Object.keys(userSumsByPeriods[0])
                .filter(user => userSumsByPeriods[0][user] > 0)
        const categoriesInCurrentPeriod =
            Object.keys(categoriesSumsByPeriods[0])
                .filter(category => categoriesSumsByPeriods[0][category] > 0)
        const periodsCountByCategories = {} // count of periods for concrete category. including current period
        categoriesInCurrentPeriod.forEach(category => {
            let periodsCountTmp = 0
            let periodNum = 0
            for (periodNum; periodNum < periodsAllCount; periodNum += 1) {
                periodsCountTmp += 1
                if (categoriesSumsByPeriods[periodNum][category] !== 0) {
                    periodsCountByCategories[category] = (periodsCountByCategories[category] || 0) + periodsCountTmp
                    periodsCountTmp = 0
                }
            }
        })

        // sums by user
        let usersSumsText = 'Потрачено [в этом | в среднем]:'
        usersInCurrentPeriod.forEach(userIdOrCategoryTitle => {
            let userName
            let perCount // periods count
            if (balanceUsers[userIdOrCategoryTitle]) {
                userName = balanceUsers[userIdOrCategoryTitle]
                perCount = periodsAllCount // user periods - all available in history
            } else {
                userName = userIdOrCategoryTitle // category title from nonUserGroups
                perCount = periodsCountByCategories[userIdOrCategoryTitle] // periods count for every category is different
            }

            const sum = Math.round(userSumsByPeriods[0][userIdOrCategoryTitle]) || 0
            const bef = Math.round(userSumsPevPeriods[userIdOrCategoryTitle] / perCount) || 0
            usersSumsText = `${usersSumsText}\r\n${userName}: ${sum} | ${bef}`
        })
        successMessages.push(new BotMessage(userId, chatId, usersSumsText))

        // sums by category
        let sumsCategoriesText = 'По категориям [в этом | в среднем]:'
        categoriesInCurrentPeriod
            .sort((cat1, cat2) =>
                Math.round(categoriesSumsByPeriods[0][cat2]) - Math.round(categoriesSumsByPeriods[0][cat1]))
            .forEach(categoryTitle => {
                const cur = Math.round(categoriesSumsByPeriods[0][categoryTitle])
                const bef = Math.round(categoriesSumsPevPeriods[categoryTitle] / periodsCountByCategories[categoryTitle])
                sumsCategoriesText = `${sumsCategoriesText}\r\n${categoryTitle}: ${cur || 0} | ${bef || 0}`
            })
        successMessages.push(new BotMessage(userId, chatId, sumsCategoriesText))

        return Observable.from(successMessages)
            .concat(balance(userId, chatId))
    })
}

/*
 * USER ACTION HELPERS
 */
const categoryChange = (userId, chatId, data, messageId) => {
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
                lastChangeBalanceBotMessageId[storageId(userId, chatId)] = messageId
                return new BotMessageEdit(messageId, chatId, `${updatedHistoryItem.value}, ${updatedHistoryItem.category}`,
                    [new InlineButtonsGroup([new InlineButton('Удалить', { hId, cmd: commands.BALANCE_REMOVE })])])
            })
    return Observable.merge(historyUpdateError, successObservable)
}

const balanceDelete = (userId, chatId, data, messageId) => {
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
    const { text, from, chat, id, user } = message
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
    else if (InputParser.isStats(text))
        messagesToUser = stats(from, chatId, text)
    else if (InputParser.isBalanceChange(text))
        messagesToUser = balanceChange(user, chatId, text, id)
    else if (InputParser.isCommentChange(lastCommands[storageId(from, chatId)]))
        messagesToUser = commentChange(from, chatId, text, id)

    if (!messagesToUser) {
        messagesToUser = help(from, chatId)
    }

    return Observable.from(messagesToUser)
        .concatMap(msgToUser => Observable.of(msgToUser).delay(10))
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
        log(`handlers.mapUserActionToHandler: can't find handler for user action callback query. userId=${from}, chatId=${chatId}, data=${JSON.stringify(data)}`, // eslint-disable-line max-len
            logLevel.ERROR)
        messagesToUser = errorToUser(from, chatId)
    }

    return Observable.from(messagesToUser)
        .concatMap(msgToUser => Observable.of(msgToUser).delay(10))
}

export default mapMessageToHandler
