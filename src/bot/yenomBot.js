import { Observable, Scheduler } from 'rxjs'
import { log, logLevel } from '../logger'
import config from '../config'
import token from '../token'
import Telegram from './telegram'
import mapUserMessageToBotMessages, { mapUserActionToBotMessages } from './handlers'
import storage, { archiveName } from '../storage'
import { IntervalTimerRx, timerTypes } from '../lib/lib/timer'
import UserMessage from './message';

const telegram = new Telegram(config.isProduction ? token.botToken.prod : token.botToken.dev)
const weeklyIntervalTimer = new IntervalTimerRx(timerTypes.WEEKLY)
const monthlyIntervalTimer = new IntervalTimerRx(timerTypes.MONTHLY)

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
    weeklyIntervalTimer.start()
    // TODO: removed monthly timer in order to avoid timer bug. Timer class should be refactored. error: (node:28334) TimeoutOverflowWarning: 2433606194 does not fit into a 32-bit signed integer. Timeout duration was set to 1  // eslint-disable-line max-len
    // monthlyIntervalTimer.start()
    return Observable.merge(userTextObservalbe, userActionsObservable)
}
