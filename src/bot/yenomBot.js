import { Observable, Scheduler } from 'rxjs'
import fetch from 'isomorphic-fetch'
import { log, logLevel } from '../logger'
import config from '../config'
import token from '../token'
import Telegram from './telegram'
import mapUserMessageToBotMessages, { mapUserActionToBotMessages, storageId } from './handlers'
import storage, { archiveName } from '../storage'
import { IntervalTimerRx, timerTypes } from '../lib/lib/timer'
import UserMessage, { BotMessage } from './message';

const telegram = new Telegram(config.isProduction ? token.botToken.prod : token.botToken.dev)
const weeklyIntervalTimer = new IntervalTimerRx(timerTypes.WEEKLY)
const monthlyIntervalTimer = new IntervalTimerRx(timerTypes.MONTHLY)
const dailyIntervalTimer = new IntervalTimerRx(timerTypes.DAILY)

const getCommandsForReportWeeklyObservable = () =>
    weeklyIntervalTimer.timerEvent()
        .switchMap(() => storage.getStorageKeys())
        .switchMap(chatIds => Observable.from(chatIds))
        .filter(chatId => chatId !== archiveName)
        .map(chatId => UserMessage.createCommand(chatId, '/stat mo su'))

const getCommandsForReportMonthlyObservable = () =>
    monthlyIntervalTimer.timerEvent()
        .switchMap(() => storage.getStorageKeys())
        .switchMap(chatIds => Observable.from(chatIds))
        .filter(chatId => chatId !== archiveName)
        .map(chatId => UserMessage.createCommand(chatId, `/stat 1.${new Date().getMonth()}`))

// region Currencies update

const getCurrencyRateObservable = () =>
    Observable.fromPromise(fetch('http://api.ratesapi.io/api/latest')
        .then(
            response => response.json(),
            error => {
                throw Error(`Error while fetching currency rates. error=<${error}>`)
            }
        ))
        .catch(error => log(`${error}`), logLevel.ERROR)

const getChatsCurrenciesObservable = () =>
    storage.getStorageKeys()
        .switchMap(chatIds => Observable.from(chatIds))
        .filter(chatId => chatId !== archiveName)
        .switchMap(chatId =>
            storage.getItem(storageId(null, chatId), 'currencies')
                .filter(currencies => Object.keys(currencies).length > 1)
                .map(currencies => Object.create({
                    chatId,
                    currencies: currencies || { RUB: 1 }
                })))
const updateCurrenciesDailyObservable = () =>
    dailyIntervalTimer.timerEvent()
        .switchMap(() => Observable.combineLatest(
            getCurrencyRateObservable(),
            getChatsCurrenciesObservable(),
            (currencyRate, { chatId, currencies }) =>
                Object.create({
                    currencyRates: currencyRate.rates,
                    chatId,
                    currencies
                })
        ))
        .map(({ currencyRates, chatId, currencies }) => {
            // TODO: atm base is EUR, consider calculate rate properly based on user's selected currency
            const newCurrencies = Object.assign({}, currencies)
            Object.keys(currencies)
                .filter(currency => currency !== 'EUR')
                .filter(currency => !!currencyRates[currency])
                .forEach(currency => {
                    newCurrencies[currency] = currencyRates[currency]
                })
            return { chatId, newCurrencies, oldCurrencies: currencies }
        })
        .flatMap(({ chatId, newCurrencies, oldCurrencies }) =>
            storage.updateItem(storageId(null, chatId), 'currencies', newCurrencies)
                .do(isSaved => {
                    if (!isSaved) {
                        log(`Error updating currencies in storage for the chat ${chatId}`, logLevel.ERROR)
                    }
                })
                .filter(isSaved => isSaved)
                .map(() => Object.create({ chatId, newCurrencies, oldCurrencies })))

// endregion

const mapBotMessageToSendResult = message => {
    const sendOrEditResultObservable = message.messageIdToEdit
        ? telegram.botMessageEdit(message)
        : telegram.botMessage(message)
    return sendOrEditResultObservable
        .switchMap(sendOrEditResult => {
            const { statusCode, messageText } = sendOrEditResult
            const { chatId } = message
            if (statusCode === 403) {
                return storage.archive(chatId)
                    .map(() => {
                        log(`yenomBot: chatId<${chatId}> forbidden error: <${messageText}>, message: <${JSON.stringify(message)}>, moving to archive`, logLevel.INFO) // eslint-disable-line max-len
                        return sendOrEditResult
                    })
            }
            if (statusCode !== 200) {
                log(`yenomBot: chatId<${chatId}> telegram send to user error: statusCode: <${statusCode}>, <${messageText}>, message: <${JSON.stringify(message)}>,`, logLevel.ERROR) // eslint-disable-line max-len
            }
            return Observable.of(sendOrEditResult)
        })
}

export default () => {
    log('yenomBot.startYenomBot()', logLevel.INFO)
    const userTextObservalbe =
        Observable.merge(
            telegram.userText(),
            getCommandsForReportWeeklyObservable(),
            getCommandsForReportMonthlyObservable()
        )
            .observeOn(Scheduler.asap)
            .mergeMap(mapUserMessageToBotMessages)
            .mergeMap(mapBotMessageToSendResult)
    const userActionsObservable = telegram.userActions()
        .observeOn(Scheduler.asap)
        .mergeMap(mapUserActionToBotMessages)
        .mergeMap(mapBotMessageToSendResult)
    const serverMessagesObservable = updateCurrenciesDailyObservable()
        .map(({ chatId, newCurrencies, oldCurrencies }) => {
            const baseCurrency = Object.keys(oldCurrencies)
                .filter(oldCurrencyKey => oldCurrencies[oldCurrencyKey] === 1)[0]
            const rateChangesText = Object.keys(oldCurrencies)
                .filter(oldCurrencyKey => oldCurrencies[oldCurrencyKey] !== 1)
                .map(oldCurrencyKey => {
                    let sign = '↔️'
                    if (oldCurrencies[oldCurrencyKey] < newCurrencies[oldCurrencyKey]) {
                        sign = '⬆️'
                    } else if (oldCurrencies[oldCurrencyKey] > newCurrencies[oldCurrencyKey]) {
                        sign = '⬇️'
                    }
                    return `\n${oldCurrencyKey}: ${oldCurrencies[oldCurrencyKey]} → ${newCurrencies[oldCurrencyKey]} ${sign}`
                })
            const text = `Курс на предстоящий день.\nБазовая валюта: ${baseCurrency} ${rateChangesText}`
            return BotMessage.createMessageForChat(
                chatId,
                text
            )
        })
        .mergeMap(mapBotMessageToSendResult)

    weeklyIntervalTimer.start()
    dailyIntervalTimer.start()
    // eslint-disable-next-line max-len
    // TODO: removed monthly timer in order to avoid timer bug. Timer class should be refactored. error: (node:28334) TimeoutOverflowWarning: 2433606194 does not fit into a 32-bit signed integer. Timeout duration was set to 1
    // monthlyIntervalTimer.start()
    return Observable.merge(userTextObservalbe, userActionsObservable, serverMessagesObservable)
}
