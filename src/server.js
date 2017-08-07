import { createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import url from 'url'

import History from './telegram/history'
import Message from './telegram/message'

import { log, logLevel } from './logger'
import _config from './config'
import _commands from './enums/commands'
import lib from './lib/root'
import FileSystem from './lib/lib/fs'   // TODO: should be refactored
import { RESPONSE_STATUS } from './lib/lib/www-server'

import Timer from './telegram/timer'
import appReducer from './reducers'
import Telegram from './telegram/telegram'

log('Start bot', logLevel.INFO)

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
)
export let store = null
export const history = new History(_config.dirStorage, 'balance-hist-$[id].json')

const fileSystem = new FileSystem()

const HISTORY_PAGE_COUNT = 50

// TODO: extenal library
const parseUrlParams = urlWithParams => {
    const res = {}
    if (urlWithParams.indexOf('?') === -1) return res
    urlWithParams.split('?')[1].split('&').forEach(pairItem => {
        const pair = pairItem.split('=')
        if (pair[0] && pair[1] !== undefined && pair[1] !== null && pair[1] !== '') {
            res[pair[0]] = pair[1]
        }
    })
    return res
}

fileSystem.isExists(_config.dirStorage)
    .then(() => {
        return fileSystem.isExists(_config.fileState)
    })
    .then(() => {
        return fileSystem.readJson(_config.fileState)
    })
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
                        text: '/repo'
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

        // WWW
        const handleApiCall = data => {
            const uri = url.parse(data.request.url).pathname
            switch (uri) {
                case '/api/historyGet':
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' })
                        data.response.end()
                        break
                    }
                    const params = parseUrlParams(data.request.url)
                    const id = params.id
                    const skipParam = params.skip || 0
                    let skip = +skipParam
                    history.getAll(id)
                        .then(items => {
                            data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                            if (skip === -1)
                                skip = items.length - HISTORY_PAGE_COUNT
                            const skipped = items.sort((a, b) => b.id - a.id).splice(+skip)
                            skipped.splice(HISTORY_PAGE_COUNT)
                            data.response.end(JSON.stringify(skipped))
                        })
                        .catch(() => {
                            data.response.writeHead(500, { 'Content-Type': 'text/plain' })
                            data.response.write('Can\'t read file')
                            data.response.end()
                        })
                    break
                case '/api/users':
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' })
                        data.response.end()
                        break
                    }
                    const { users } = store.getState()
                    data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                    data.response.end(JSON.stringify(users))
                    break
                default:
                // no-op
            }
        }
        lib.www.apiUrls = ['/api/historyGet', '/api/users']
        lib.www.httpServerSet = 42042
        lib.www.response.subscribe(serverData => {
            const { data, status } = serverData
            switch (status) {
                case RESPONSE_STATUS.HTTP_200:
                    break
                case RESPONSE_STATUS.HTTP_404:
                    data.response.writeHead(200, { 'Content-Type': 'text/plain' })
                    data.response.end('404 Not Found\n')
                    break
                case RESPONSE_STATUS.API_CALL:
                    handleApiCall(data)
                    break
                default:
                // no-op
            }
        })
        // END WWW
    })
    .catch(() => {
        log(`Directory ${_config.dirStorage} or file ${_config.fileState} with content or [] not exist`, logLevel.ERROR)
    })
