import {
    HISTORY_FETCH_DONE,
    USERS_FETCH_DONE,
    HISTORY_SKIP
} from './actions'

const defaultState = {
    historyId: null,
    historyData: [],
    historyOrder: [],
    historySkip: 0,
    users: {}
}

const historyId = () => -211718771

const historyData = (state = defaultState.historyData, action) => {
    switch (action.type) {
        case HISTORY_FETCH_DONE:
            return action.data
        default:
    }
    return state
}

const historyOrder = (state = defaultState.historyOrder, action) => {
    switch (action.type) {
        case HISTORY_FETCH_DONE:
            return action.data.map(item => item.id)
        default:
    }
    return state
}

const users = (state = defaultState.users, action) => {
    switch (action.type) {
        case USERS_FETCH_DONE:
            return action.data
        default:
    }
    return state
}

const historySkip = (state = defaultState.historySkip, action) => {
    switch (action.type) {
        case HISTORY_SKIP:
            return action.skip
        default:
    }
    return state
}

export default (state = defaultState, action) => ({
    historyId: historyId(state.historyId, action),
    historyData: historyData(state.historyData, action),
    historyOrder: historyOrder(state.historyOrder, action),
    historySkip: historySkip(state.historySkip, action),
    users: users(state.users, action)
})
