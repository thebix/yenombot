import fetch from 'isomorphic-fetch'

import _config from '../../config'

export const HISTORY_FETCH = 'HISTORY_FETCH'
export const HISTORY_FETCH_DONE = 'HISTORY_FETCH_DONE'
export const HISTORY_SKIP = 'HISTORY_SKIP'
export const USERS_FETCH = 'USERS_FETCH'
export const USERS_FETCH_DONE = 'USERS_FETCH_DONE'

const restUrl = _config.isProduction ? '' : '//127.0.0.1:42042'

const historyFetchDone = (id, json) => ({
    type: HISTORY_FETCH_DONE,
    id,
    data: json || []
})

export const historyFetch = (id, skip = 0) => dispatch =>
    fetch(`${restUrl}/api/historyGet?id=${id}&skip=${skip}`, {
        method: 'POST',
        body: JSON.stringify({ id, skip })
    })
        // Do not use catch, because that will also catch
        // any errors in the dispatch and resulting render,
        // causing an loop of 'Unexpected batch number' errors.
        // https://github.com/facebook/react/issues/6895
        .then(response => response.json(), error => console.log('An error occured.', error))
        .then(json => dispatch(historyFetchDone(id, json)))

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
        .then(response => response.json(), error => console.log('An error occured.', error))
        .then(json => dispatch(usersFetchDone(json)))
