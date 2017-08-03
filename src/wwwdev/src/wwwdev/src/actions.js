import fetch from 'isomorphic-fetch'

export const HISTORY_FETCH = 'HISTORY_FETCH'
export const HISTORY_FETCH_DONE = 'HISTORY_FETCH_DONE'

const historyFetchDone = (file, id, data) => ({
    type: HISTORY_FETCH_DONE,
    id,
    file,
    data
})

export const historyFetch = (id) => dispatch => {
    return fileSystem.getJson(file)
        .then(data => dispatch(jsonReadDone(file, id, data)))
        .catch(() => {
            // TODO: обработка ошибки
        })
}