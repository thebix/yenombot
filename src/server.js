// import { createStore, compose, applyMiddleware } from 'redux'
// import thunkMiddleware from 'redux-thunk'
// import url from 'url'
import { Subscription } from 'rxjs'
import nodeCleanup from 'node-cleanup'
import yenomBot from './bot/yenomBot'
import yenomWww from './yenomWww'
import storage from './storage'

// import History from './telegram/history'
// import Message from './telegram/message'

import { log, logLevel } from './logger'
import _config from './config'
import _commands from './enums/commands'
import lib from './lib/root'
// import FileSystem from './lib/lib/fs'   // TODO: should be refactored
// import { RESPONSE_STATUS } from './lib/lib/www-server'

// import Timer from './telegram/timer'
// import appReducer from './reducers'
// import Telegram from './telegram/telegram'


// import { Observable } from 'rxjs/Observable'

log('Start bot', logLevel.INFO)

const compositeSubscription = new Subscription()

nodeCleanup((exitCode, signal) => {
    log(`server:nodeCleanup: clean. exitCode: <${exitCode}>, signal: <${signal}>`, logLevel.INFO)
    compositeSubscription.unsubscribe()
})

// bot
compositeSubscription.add(
    storage.isInitialized()
        .filter(isStorageInitizlized => isStorageInitizlized)
        .mergeMap(() => yenomBot())
        .subscribe(
        () => { },
        error => {
            log(`Unhandled exception: server.yenombot: error while handling userText / userAvtions. Error=${error && error.message ? error.message : JSON.stringify(error)}`, logLevel.ERROR)
            compositeSubscription.unsubscribe()
        }))

// www
compositeSubscription.add(
    storage.isInitialized()
        .filter(isStorageInitizlized => isStorageInitizlized)
        .mergeMap(() => yenomWww())
        .subscribe(
        () => { },
        error => {
            log(`Unhandled exception: server.yenomWww: Error=${error && error.message ? error.message : JSON.stringify(error)}`, logLevel.ERROR)
            compositeSubscription.unsubscribe()
        }))

// const enhancer = compose(
//     applyMiddleware(thunkMiddleware)
// )
// export let store = null // eslint-disable-line import/no-mutable-exports
// export const history = new History(_config.dirStorage, 'hist-$[id].json')

// const fileSystem = new FileSystem()

// fileSystem.isExists(_config.dirStorage)
//     .then(() => fileSystem.isExists(_config.fileState))
//     .then(() => fileSystem.readJson(_config.fileState))
//     .then(stateFromFile => {
//         const state = stateFromFile || {}
//         store = createStore(appReducer, state, enhancer)

//         const weekly = new Timer('weekly', () => {
//             const promises = []
//             Object.keys(store.getState().balance)
//                 .forEach(chatId => {
//                     // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
//                     promises.push(bot.trigger(_commands.BALANCE_STATS, new Message({
//                         chat: {
//                             id: chatId
//                         },
//                         text: '/stat mo su'
//                     })))
//                 })
//             Promise.all(promises)
//                 .then(() => log('Еженедельная рассылка прошла успешно.', logLevel.INFO))
//                 .catch(ex => log(`Еженедельная рассылка прошла с ошибкой. ${ex}`, logLevel.ERROR))
//             weekly.start({
//                 dateTime: lib.time.getChangedDateTime({ seconds: 23 },
//                     lib.time.getMonday(new Date(), true))
//             })
//         })
//         const monthly = new Timer('monthly', () => {
//             const promises = []
//             Object.keys(store.getState().balance)
//                 .forEach(chatId => {
//                     // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
//                     promises.push(bot.trigger(_commands.BALANCE_STATS, new Message({
//                         chat: {
//                             id: chatId
//                         },
//                         text: `/stat 1.${new Date().getMonth()}` // prev month
//                     })))
//                     promises.push(bot.trigger(_commands.BALANCE_REPORT, new Message({
//                         chat: {
//                             id: chatId,
//                             title: `monthly-${lib.time.dateString()}`
//                         },
//                         text: '/repo'
//                     }), {
//                             noBalance: true // eslint-disable-line indent
//                         })) // eslint-disable-line indent
//                 })
//             Promise.all(promises)
//                 .then(() => log('Ежемесячная рассылка прошла успешно.', logLevel.INFO))
//                 .catch(ex => log(`Ежемесячная рассылка прошла с ошибкой. ${ex}`, logLevel.ERROR))
//             const dt = new Date()
//             const nextMonth = lib.time.getChangedDateTime({ months: 1, seconds: 23 },
//                 new Date(dt.getFullYear(), dt.getMonth(), 1))
//             monthly.start({ dateTime: nextMonth })
//         })

//         log('Set timers...', logLevel.INFO)
//         const monday = lib.time.getChangedDateTime({ seconds: 23 },
//             lib.time.getMonday(new Date(), true))
//         log(`Set weekly timer. Next monday: ${monday}`, logLevel.INFO)
//         // weekly.start({ dateTime: monday })

//         const dt = new Date()
//         const nextMonth = lib.time.getChangedDateTime({ months: 1, seconds: 23 },
//             new Date(dt.getFullYear(), dt.getMonth(), 1))
//         log(`Set monthly timer. Next month: ${nextMonth}`, logLevel.INFO)
//         // monthly.start({ dateTime: nextMonth })
//         // if (false) {
//     })
//     .catch(() => {
//         log(`Directory ${_config.dirStorage} or file ${_config.fileState} with content or [] not exist`, logLevel.ERROR)
//     })

