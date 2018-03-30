import { Subscription } from 'rxjs'
import nodeCleanup from 'node-cleanup'
import yenomBot from './bot/yenomBot'
import yenomWww from './yenomWww'
import yenomMl from './ml/yenomMl'
import storage from './storage'
import { log, logLevel } from './logger'

log('Starting server', logLevel.INFO)

const compositeSubscription = new Subscription()

nodeCleanup((exitCode, signal) => {
    log(`server:nodeCleanup: clean. exitCode: <${exitCode}>, signal: <${signal}>`, logLevel.INFO)
    compositeSubscription.unsubscribe()
})

compositeSubscription.add(
    storage.isInitialized()
        .filter(isStorageInitizlized => isStorageInitizlized)
        .mergeMap(() => yenomMl('-211718771'))
        .subscribe(
            () => { log(`ML: files with data prepared for chatId:<${'-211718771'}>`) },
            error => {
                log(`Unhandled exception: server.yenomMl: no info. Error=${error && error.message
                    ? error.message : JSON.stringify(error)}`, logLevel.ERROR)
                compositeSubscription.unsubscribe()
            }))


// // bot
// compositeSubscription.add(
//     storage.isInitialized()
//         .filter(isStorageInitizlized => isStorageInitizlized)
//         .mergeMap(() => yenomBot())
//         .subscribe(
//         () => { },
//         error => {
//             log(`Unhandled exception: server.yenombot: error while handling userText / userActions. Error=${error && error.message
//                 ? error.message : JSON.stringify(error)}`, logLevel.ERROR)
//             compositeSubscription.unsubscribe()
//         }))

// // www
// compositeSubscription.add(
//     storage.isInitialized()
//         .filter(isStorageInitizlized => isStorageInitizlized)
//         .mergeMap(() => yenomWww())
//         .subscribe(
//         () => { },
//         error => {
//             log(`Unhandled exception: server.yenomWww: Error=${error && error.message ? error.message : JSON.stringify(error)}`, logLevel.ERROR)
//             compositeSubscription.unsubscribe()
//         }))
