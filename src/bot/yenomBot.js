import { Observable } from 'rxjs'
import { log, logLevel } from '../logger'
import config from '../config'
import token from '../token'
import Telegram from './telegram'
import mapMessageToHandler, { mapUserActionToHandler } from './handlers'

const telegram = new Telegram(config.isProduction ? token.botToken.prod : token.botToken.dev)

const startYenombot = () => {
    log('yenomBot.startVkoBot()', logLevel.DEBUG)
    log('starting Telegram bot', logLevel.DEBUG)
    const userTextObservalbe = telegram.userText()
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
    return Observable.merge(userTextObservalbe, userActionsObservable)
}

export default startYenombot
