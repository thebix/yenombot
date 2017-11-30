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
export let store = null // eslint-disable-line import/no-mutable-exports
export const history = new History(_config.dirStorage, 'balance-hist-$[id].json')

const fileSystem = new FileSystem()

const HISTORY_PAGE_COUNT = 150

// TODO: extenal library
// const parseUrlParams = urlWithParams => {
//     const uri = decodeURI(urlWithParams)
//     const res = {}
//     if (uri.indexOf('?') === -1) return res
//     uri.split('?')[1].split('&').forEach(pairItem => {
//         const pair = pairItem.split('=')
//         if (pair[0] && pair[1] !== undefined && pair[1] !== null && pair[1] !== '') {
//             res[pair[0]] = pair[1]
//         }
//     })
//     return res
// }

fileSystem.isExists(_config.dirStorage)
    .then(() => fileSystem.isExists(_config.fileState))
    .then(() => fileSystem.readJson(_config.fileState))
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
                            noBalance: true // eslint-disable-line indent
                        })) // eslint-disable-line indent
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
                    // TODO: rxjs
                    data.request.on('data', chunk => {
                        if (!chunk) return
                        const body = JSON.parse(chunk.toString())
                        const {
                            id,
                            categories,
                            users,
                            dateStart,
                            dateEnd } = body
                        const skipParam = body.skip || 0
                        let skip = +skipParam
                        // TODO: rxjs
                        history.getAll(id)
                            .then(items => {
                                data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                                const cats = categories ? categories.split(',') : []
                                const usrs = users ? users.split(',') : []
                                const dtStart = dateStart ? new Date(+dateStart) : null
                                const dtEnd = dateEnd ? new Date(+dateEnd) : null
                                const elements = items
                                    .filter(item => (cats.length === 0 || cats.indexOf(item.category) > -1)
                                        && (usrs.length === 0 || usrs.indexOf(`${item.user_id}`) > -1)
                                        && (!dtStart || (dtStart.getTime() <= (new Date(item.date_create)).getTime()))
                                        && (!dtEnd || (dtEnd.getTime() > (new Date(item.date_create)).getTime())))
                                    .sort((a, b) => b.id - a.id)
                                const elementsLength = elements.length
                                if (skip === -1)
                                    skip = elementsLength - HISTORY_PAGE_COUNT
                                const skipped = elements.slice(+skip)
                                skipped.splice(HISTORY_PAGE_COUNT)
                                const activeCategories = {}
                                Array.from(new Set(elements.map(item => item.category)))
                                    .forEach(category => {
                                        activeCategories[category] = {
                                            sum: elements
                                                .filter(it => !it.date_delete && it.category === category)
                                                .map(it => it.value || 0)
                                                .reduce((sum, prev) => sum + prev, 0)
                                        }
                                    })
                                const activeUsersIds = {}
                                const nonUserGroups = store.getState().nonUserPaymentGroups[id] || []
                                Array.from(new Set(elements.map(item => item.user_id)))
                                    .forEach(userId => {
                                        activeUsersIds[userId] = {
                                            sum: elements
                                                .filter(it => !it.date_delete && it.user_id === userId
                                                    && nonUserGroups.indexOf(it.category) === -1)
                                                .map(it => it.value || 0)
                                                .reduce((sum, prev) => sum + prev, 0)
                                        }
                                    })
                                const totalSum = elements.filter(it => !it.date_delete)
                                    .reduce((sum, current) => sum + current.value, 0)
                                data.response.end(JSON.stringify({
                                    data: skipped,
                                    meta: {
                                        length: elementsLength,
                                        activeCategories,
                                        activeUsersIds,
                                        totalSum
                                    }
                                }))
                            })
                            .catch(err => {
                                log(err, logLevel.ERROR)
                                data.response.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                                data.response.write('Can\'t read file')
                                data.response.end()
                            })
                    }).on('end', () => {
                        // no-op
                    })
                    break
                case '/api/historySet':
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' })
                        data.response.end()
                        break
                    }
                    // TODO: rxjs
                    data.request.on('data', chunk => {
                        if (!chunk) return
                        const body = JSON.parse(chunk.toString())
                        const { id, chatId, ...changes } = body
                        if (id > 0 && changes) {
                            history.setById(id, changes, chatId)
                                .then(() => {
                                    data.response.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
                                    data.response.end('ok')
                                })
                                .catch(() => {
                                    data.response.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
                                    data.response.end('Write history error')
                                })
                        } else {
                            data.response.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
                            data.response.end('Write history error')
                        }
                    }).on('end', () => {
                        // no-op
                    })
                    break
                case '/api/users': {
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' })
                        data.response.end()
                        break
                    }
                    const { users } = store.getState()
                    data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                    data.response.end(JSON.stringify(users))
                }
                    break
                case '/api/categories':
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' })
                        data.response.end()
                        break
                    }
                    // TODO: rxjs
                    data.request.on('data', chunk => {
                        if (!chunk) return
                        const { chatId } = JSON.parse(chunk.toString())
                        data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                        data.response.end(JSON.stringify(store.getState().paymentGroups[chatId]))
                    }).on('end', () => {
                        // no-op
                    })
                    break
                default:
                // no-op
            }
        }
        lib.www.apiUrls = ['/api/historyGet', '/api/users', '/api/categories', '/api/historySet']
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
