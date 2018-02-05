import { Observable } from 'rxjs'
import { log, logLevel } from '../logger'
import config from '../config'
import token from '../token'
import Telegram from './telegram'
import mapMessageToHandler, { mapUserActionToHandler } from './handlers'
import storage from '../storage'
import { IntervalTimerRx, timerTypes } from '../lib/lib/timer'
import UserMessage from './message';

const telegram = new Telegram(config.isProduction ? token.botToken.prod : token.botToken.dev)
const weeklyIntervalTimer = new IntervalTimerRx(timerTypes.WEEKLY)
const monthlyIntervalTimer = new IntervalTimerRx(timerTypes.MONTHLY)

const getCommandsForReportWeeklyObservable = () =>
    Observable.combineLatest(
        storage.getStorageKeys(),
        weeklyIntervalTimer.timerEvent(),
        chatIds => chatIds.map(chatId =>
            UserMessage.createCommand(chatId, '/stat mo su')
        )
    ).flatMap(commands => Observable.from(commands || []))

const getCommandsForReportMonthlyObservable = () =>
    Observable.combineLatest(
        storage.getStorageKeys(),
        monthlyIntervalTimer.timerEvent(),
        chatIds => chatIds.map(chatId =>
            UserMessage.createCommand(chatId, `/stat 1.${new Date().getMonth()}`)
        )
    ).flatMap(commands => Observable.from(commands || []))

export default () => {
    log('yenomBot.startVkoBot()', logLevel.DEBUG)
    const userTextObservalbe =
        Observable.merge(
            telegram.userText(),
            getCommandsForReportWeeklyObservable(),
            getCommandsForReportMonthlyObservable()
        )
            // TODO: proper observeOn / subscribeOn
            // .observeOn(Scheduler.async)
            // .subscribeOn(Scheduler.async)
            .mergeMap(mapMessageToHandler)
            .mergeMap(message => telegram.messageToUser(message))

    const userActionsObservable = telegram.userActions()
        // TODO: proper observeOn / subscribeOn
        // .observeOn(Scheduler.async)
        // .subscribeOn(Scheduler.async)
        .mergeMap(mapUserActionToHandler)
        .mergeMap(message => {
            return message.messangerMessageIdToEdit
                ? telegram.messageToUserEdit(message)
                : telegram.messageToUser(message)
        })
    telegram.start()
    weeklyIntervalTimer.start()
    monthlyIntervalTimer.start()
    return Observable.merge(userTextObservalbe, userActionsObservable)
}
