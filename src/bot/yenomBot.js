import { Observable } from 'rxjs'
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
        .map(chatId =>
            UserMessage.createCommand(chatId, '/stat mo su')
        )

const getCommandsForReportMonthlyObservable = () =>
    monthlyIntervalTimer.timerEvent()
        .switchMap(() => storage.getStorageKeys())
        .switchMap(chatIds => Observable.from(chatIds))
        .filter(chatId => chatId !== archiveName)
        .map(chatId =>
            UserMessage.createCommand(chatId, `/stat 1.${new Date().getMonth()}`)
        )

const mapBotMessageToSendResult = message => {
    const sendOrEditResultObservable = message.messageIdToEdit
        ? telegram.botMessageEdit(message)
        : telegram.botMessage(message)
    return sendOrEditResultObservable
        .switchMap(sendOrEditResult => {
            const { statusCode } = sendOrEditResult
            const { chatId } = message
            if (statusCode !== 200) {
                return storage.archive(chatId)
                    .map(() => {
                        log(`yenomBot: chatId<${chatId}> error, move to archive`, logLevel.INFO)
                        return sendOrEditResult
                    })
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
            // TODO: proper observeOn / subscribeOn
            // .observeOn(Scheduler.async)
            // .subscribeOn(Scheduler.async)
            .mergeMap(mapUserMessageToBotMessages)
            .mergeMap(mapBotMessageToSendResult)
    const userActionsObservable = telegram.userActions()
        // TODO: proper observeOn / subscribeOn
        // .observeOn(Scheduler.async)
        // .subscribeOn(Scheduler.async)
        .mergeMap(mapUserActionToBotMessages)
        .mergeMap(mapBotMessageToSendResult)
    weeklyIntervalTimer.start()
    monthlyIntervalTimer.start()
    return Observable.merge(userTextObservalbe, userActionsObservable)
}
