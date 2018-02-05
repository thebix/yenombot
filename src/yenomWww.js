import { Observable } from 'rxjs'
import config from './config'
import WwwServer, { mimeTypes, WwwResponse } from './lib/lib/wwwServer'
import { log, logLevel } from './logger'
import history from './history/history'
import storage from './storage'

const HISTORY_PAGE_COUNT = 150

const handleApiError404 = urlPath => new WwwResponse({
    httpCode: 404,
    filePath: urlPath,
    contentType: mimeTypes.text,
    data: '404 not found'
})
const handleApiError500 = (urlPath, error) => new WwwResponse({
    httpCode: 500,
    filePath: urlPath,
    contentType: mimeTypes.text,
    data: error
})

const handleApi = {
    '/api/categories': ({ body, method }) => {
        const { chatId } = body
        if (method !== 'POST' || !chatId)
            return Observable.of(handleApiError404('/api/categories'))
        return storage.getItem(chatId, 'paymentGroups')
            .map(storageCategories => new WwwResponse({
                httpCode: 200,
                filePath: '/api/categories',
                contentType: mimeTypes.json,
                data: JSON.stringify(storageCategories || []),
                headData: [{ 'Access-Control-Allow-Origin': '*' }]
            }))
    },
    '/api/users': ({ body, method }) => {
        const { chatId } = body
        if (method !== 'POST' || !chatId)
            return Observable.of(handleApiError404('/api/users'))
        return storage.getItem(chatId, 'balanceUsers')
            .map(storageBalanceUsers => new WwwResponse({
                httpCode: 200,
                filePath: '/api/users',
                contentType: mimeTypes.json,
                data: JSON.stringify(storageBalanceUsers || []),
                headData: [{ 'Access-Control-Allow-Origin': '*' }]
            }))
    },
    '/api/historyGet': ({ body, method }) => {
        const {
            id: chatId,
            categories: bodyCategories,
            users: bodyUsers,
            dateStart,
            dateEnd,
            skip: skipParam = 0 } = body
        if (method !== 'POST' || !chatId)
            return Observable.of(handleApiError404('/api/historyGet'))
        let skip = +skipParam
        return Observable.combineLatest(
            history.getAll(chatId),
            storage.getItem(chatId, 'nonUserPaymentGroups'),
            (historyAll, nonUserPaymentCategories) => {
                const categories = bodyCategories ? bodyCategories.split(',') : []
                const users = bodyUsers ? bodyUsers.split(',') : []
                const dtStart = dateStart ? new Date(+dateStart) : null
                const dtEnd = dateEnd ? new Date(+dateEnd) : null
                const historyFiltered = historyAll
                    .filter(item => (categories.length === 0 || categories.indexOf(item.category) > -1)
                        && (users.length === 0 || users.indexOf(`${item.user_id}`) > -1)
                        && (!dtStart || (dtStart.getTime() <= (new Date(item.date_create)).getTime()))
                        && (!dtEnd || (dtEnd.getTime() > (new Date(item.date_create)).getTime())))
                    .sort((a, b) => b.id - a.id)
                const historyFilteredLength = historyFiltered.length
                if (skip === -1)
                    skip = historyFilteredLength - HISTORY_PAGE_COUNT
                const historyFilteredSkipped = historyFiltered.slice(+skip)
                historyFilteredSkipped.splice(HISTORY_PAGE_COUNT)

                const activeCategories = {}
                Array.from(new Set(historyFiltered.map(item => item.category)))
                    .forEach(category => {
                        activeCategories[category] = {
                            sum: historyFiltered
                                .filter(it => !it.date_delete && it.category === category)
                                .map(it => it.value || 0)
                                .reduce((sum, prev) => sum + prev, 0)
                        }
                    })

                const activeUsersIds = {}
                const nonUserCategories = nonUserPaymentCategories || []
                Array.from(new Set(historyFiltered.map(item => item.user_id)))
                    .forEach(userId => {
                        activeUsersIds[userId] = {
                            sum: historyFiltered
                                .filter(it => !it.date_delete && it.user_id === userId
                                    && nonUserCategories.indexOf(it.category) === -1)
                                .map(it => it.value || 0)
                                .reduce((sum, prev) => sum + prev, 0)
                        }
                    })

                const totalSum = historyFiltered.filter(it => !it.date_delete)
                    .reduce((sum, current) => sum + current.value, 0)

                return new WwwResponse({
                    httpCode: 200,
                    filePath: '/api/historyGet',
                    contentType: mimeTypes.json,
                    headData: [{ 'Access-Control-Allow-Origin': '*' }],
                    data: JSON.stringify({
                        data: historyFilteredSkipped,
                        meta: {
                            length: historyFilteredLength,
                            activeCategories,
                            activeUsersIds,
                            totalSum
                        }
                    })
                })
            }
        )
    },
    '/api/historySet': ({ body, method }) => {
        const { id, chatId, ...changes } = body
        if (method !== 'POST' || !chatId)
            return Observable.of(handleApiError404('/api/historySet'))
        if (id <= 0 || !changes)
            return Observable.of(handleApiError500('/api/historySet', 'Write history error'))

        return history.update(id, changes, chatId)
            .map(updatedItem => {
                if (!updatedItem)
                    return Observable.of(handleApiError500('/api/historySet', 'Write history error'))
                return new WwwResponse({
                    httpCode: 200,
                    filePath: '/api/historySet',
                    contentType: mimeTypes.json,
                    data: 'ok',
                    headData: [{ 'Access-Control-Allow-Origin': '*' }]
                })
            })
    }
}

export default () => {
    log('yenomWww', logLevel.DEBUG)
    const wwwServer = new WwwServer({
        port: config.www.port,
        wwwRoot: config.www.wwwRoot,
        handleApi
    })
    return wwwServer.response
}
