import fetch from 'isomorphic-fetch'

import _config from '../../config'
import l from '../../logger'

export const HISTORY_FETCH = 'HISTORY_FETCH'
export const HISTORY_FETCH_DONE = 'HISTORY_FETCH_DONE'
export const HISTORY_SKIP = 'HISTORY_SKIP'
export const USERS_FETCH = 'USERS_FETCH'
export const USERS_FETCH_DONE = 'USERS_FETCH_DONE'
export const HISTORY_USER_TOGGLE = 'HISTORY_USER_TOGGLE'
export const HISTORY_CATEGORIES_FETCH = 'HISTORY_CATEGORIES_FETCH'
export const HISTORY_CATEGORIES_FETCH_DONE = 'HISTORY_CATEGORIES_FETCH_DONE'
export const HISTORY_CATEGORY_TOGGLE = 'HISTORY_CATEGORY_TOGGLE'
export const HISTORY_CATEGORIES_SELECTED = 'HISTORY_CATEGORIES_SELECTED'
export const HISTORY_DATE_START = 'HISTORY_DATE_START'
export const HISTORY_DATE_END = 'HISTORY_DATE_END'
export const HISTORY_EDIT_ON = 'HISTORY_EDIT_ON'
export const HISTORY_EDIT_OFF = 'HISTORY_EDIT_OFF'
export const HISTORY_SAVE = 'HISTORY_SAVE'
export const HISTORY_SAVE_DONE = 'HISTORY_SAVE_DONE'
export const HISTORY_SAVE_UNDO = 'HISTORY_SAVE_UNDO'
export const HISTORY_UPDATE = 'HISTORY_UPDATE'

const restUrl = _config.isProduction ? '' : '//127.0.0.1:42042'

const historyFetchDone = (id, json) => ({
    type: HISTORY_FETCH_DONE,
    id,
    data: json.data || [],
    meta: json.meta
})

// categories = ['cat1', 'cat2', 'cat3']
export const historyFetch = (id,
    skip = 0,
    categories = [],
    selectedUsers = [],
    dateStart,
    dateEnd) =>
    dispatch => {
        l.d('action.historyFetch()')
        let cats = ''
        if (Array.isArray(categories) && categories.length > 0) {
            cats = categories.join(',')
        }
        let usrs = ''
        if (Array.isArray(selectedUsers) && selectedUsers.length > 0) {
            usrs = selectedUsers.join(',')
        }
        return fetch(`${restUrl}/api/historyGet`, {
            method: 'POST',
            body: JSON.stringify({ id, skip, dateStart, dateEnd, categories: cats, users: usrs })
        })
            // Do not use catch, because that will also catch
            // any errors in the dispatch and resulting render,
            // causing an loop of 'Unexpected batch number' errors.
            // https://github.com/facebook/react/issues/6895
            .then(response => response.json(), error => l.e('An error occured.', error))
            .then(json => dispatch(historyFetchDone(id, json)))
    }

export const historySkipAction = skip => ({
    type: HISTORY_SKIP,
    skip
})

const usersFetchDone = json => ({
    type: USERS_FETCH_DONE,
    data: json || {}
})

export const usersFetch = () => dispatch =>
    fetch(`${restUrl}/api/users`, {
        method: 'POST'
    })
        .then(response => response.json(), error => l.e('An error occured.', error))
        .then(json => dispatch(usersFetchDone(json)))

export const historyUserToggle = id => ({
    type: HISTORY_USER_TOGGLE,
    data: id
})

const categoriesFetchDone = json => ({
    type: HISTORY_CATEGORIES_FETCH_DONE,
    data: json || {}
})

export const categoriesFetch = chatId => dispatch => {
    l.d('action.categoriesFetch()')
    return fetch(`${restUrl}/api/categories`, {
        method: 'POST',
        body: JSON.stringify({ chatId })
    })
        .then(response => response.json(), error => l.e('An error occured.', error))
        .then(json => dispatch(categoriesFetchDone(json)))
}

export const historyCategoryToggle = category => ({
    type: HISTORY_CATEGORY_TOGGLE,
    data: category
})

export const historyCategoriesSelected = (categories = []) => ({
    type: HISTORY_CATEGORIES_SELECTED,
    data: categories
})

export const historyDateSet = (date = new Date(), isStart = true) => ({
    type: isStart ? HISTORY_DATE_START : HISTORY_DATE_END,
    data: date
})

export const historyEditSwitch = (id = null) => ({
    type: id === null ? HISTORY_EDIT_OFF : HISTORY_EDIT_ON,
    data: id
})

const historySaveDone = (isError = false) => ({
    type: HISTORY_SAVE_DONE,
    data: isError
})

// changes = { value, category, comment, date_delete, date_create }
export const historySave = (chatId, id, changes) =>
    dispatch => fetch(`${restUrl}/api/historySet`, {
        method: 'POST',
        body: JSON.stringify({
            ...changes,
            chatId,
            id
        })
    })
        // Do not use catch, because that will also catch
        // any errors in the dispatch and resulting render,
        // causing an loop of 'Unexpected batch number' errors.
        // https://github.com/facebook/react/issues/6895
        .then(response => response.status !== 200, error => {
            historySaveDone(true)
            l.e('An error occured.', error)
        })
        .then(isError => dispatch(historySaveDone(isError)))

export const historySaveUndo = (chatId, id, changes) => ({
    type: HISTORY_SAVE_UNDO,
    chatId,
    id,
    changes
})

export const historyShouldUpdate = (shouldUpdate = true) => ({
    type: HISTORY_UPDATE,
    data: shouldUpdate
})
