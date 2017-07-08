import { createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import FileSystem from './lib/filesystem'
import History from './lib/history'
import Message from './lib/message'

import { log, logLevel } from './logger'
import _config from './config'
import _commands from './enums/commands'
import lib from './lib/index'

import Timer from './lib/timer'
import appReducer from './reducers'
import Telegram from './lib/telegram'

log('Start bot', logLevel.INFO)

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
)
export let store = null
export const history = new History(_config.dirStorage, 'balance-hist-$[id].json')

if (FileSystem.isDirExists(_config.dirStorage, true)
    && FileSystem.isFileExists(_config.fileState, true, false, '{}')) { // TODO: починить варнинг
    FileSystem.readJson(_config.fileState)
        .then(stateFromFile => {
            const state = stateFromFile || {}
            store = createStore(appReducer, state, enhancer)
            const bot = new Telegram()
            bot.listen()

            const weekly = new Timer('weekly', () => {
                const promises = []
                Object.keys(store.getState().balance)
                    .forEach(chatId => {
                        // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
                        promises.push(bot.trigger(_commands.BALANCE_STATS, new Message({
                            chat: {
                                id: chatId
                            },
                            text: '/stat mo su'
                        })))
                    })
                Promise.all(promises)
                    .then(() => log('Еженедельная рассылка прошла успешно.', logLevel.INFO))
                    .catch(ex => log(`Еженедельная рассылка прошла с ошибкой. ${ex}`, logLevel.ERROR))
                weekly.start({
                    dateTime: lib.time.getChangedDateTime({ seconds: 23 },
                        lib.time.getMonday(new Date(), true))
                })
            })
            const monthly = new Timer('monthly', () => {
                const promises = []
                Object.keys(store.getState().balance)
                    .forEach(chatId => {
                        // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
                        promises.push(bot.trigger(_commands.BALANCE_STATS, new Message({
                            chat: {
                                id: chatId
                            },
                            text: `/stat 1.${new Date().getMonth()}` // prev month
                        })))
                        promises.push(bot.trigger(_commands.BALANCE_REPORT, new Message({
                            chat: {
                                id: chatId,
                                title: `monthly-${lib.time.dateString()}`
                            },
                            text: '/repo',
                        }), {
                            noBalance: true
                        }))
                    })
                Promise.all(promises)
                    .then(() => log('Ежемесячная рассылка прошла успешно.', logLevel.INFO))
                    .catch(ex => log(`Ежемесячная рассылка прошла с ошибкой. ${ex}`, logLevel.ERROR))
                const dt = new Date()
                const nextMonth = lib.time.getChangedDateTime({ months: 1, seconds: 23 },
                    new Date(dt.getFullYear(), dt.getMonth(), 1))
                monthly.start({ dateTime: nextMonth })
            })

            log('Set timers...', logLevel.INFO)
            const monday = lib.time.getChangedDateTime({ seconds: 23 },
                lib.time.getMonday(new Date(), true))
            log(`Set weekly timer. Next monday: ${monday}`, logLevel.INFO)
            weekly.start({ dateTime: monday })

            const dt = new Date()
            const nextMonth = lib.time.getChangedDateTime({ months: 1, seconds: 23 },
                new Date(dt.getFullYear(), dt.getMonth(), 1))
            log(`Set monthly timer. Next month: ${nextMonth}`, logLevel.INFO)
            monthly.start({ dateTime: nextMonth })
        })
        .catch(x => {
            log(`Ошибка чтения файла прошлого состояния. err = ${x}`, logLevel.ERROR)
        })
}
