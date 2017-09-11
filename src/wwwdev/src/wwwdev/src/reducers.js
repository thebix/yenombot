import {
    HISTORY_FETCH_DONE,
    USERS_FETCH_DONE,
    HISTORY_SKIP,
    HISTORY_CATEGORIES_FETCH_DONE,
    HISTORY_CATEGORY_TOGGLE,
    HISTORY_CATEGORIES_SELECTED,
    HISTORY_USER_TOGGLE,
    HISTORY_DATE_START,
    HISTORY_DATE_END
} from './actions'

const defaultState = {
    historyId: null,
    historyData: {
        data: [], meta: { length: 0 }
    },
    historyOrder: [],
    historySkip: 0,
    histroyCategories: [],
    historySelectedCategories: [],
    users: {},
    historySelectedUsers: [],
    historySelectedDates: { dateStart: null, dateEnd: null }
}

// TODO: chat selector
const historyId = () => -211718771

const historyData = (state = defaultState.historyData, action) => {
    const { data, meta } = action
    switch (action.type) {
        case HISTORY_FETCH_DONE:
            return { ...state, data, meta }
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

const historyCategories = (state = defaultState.historyCategories, action) => {
    switch (action.type) {
        case HISTORY_CATEGORIES_FETCH_DONE:
            return action.data
        default:
    }
    return state
}

const historySelectedCategories = (state = defaultState.historySelectedCategories, action) => {
    let res
    switch (action.type) {
        case HISTORY_CATEGORY_TOGGLE:
            {
                const index = state.indexOf(action.data)
                if (index !== -1)
                    res = [
                        ...state.slice(0, index),
                        ...state.slice(index + 1)
                    ]
                else
                    res = [
                        ...state.splice(0, index),
                        action.data,
                        ...state.splice(index + 1)
                    ]
            }
            return res
        case HISTORY_CATEGORIES_SELECTED:
            if (Array.isArray(action.data))
                return action.data
            break
        default:
    }
    return state
}

const historySelectedUsers = (state = defaultState.historySelectedUsers, action) => {
    let res
    switch (action.type) {
        case HISTORY_USER_TOGGLE:
            {
                const index = state.indexOf(action.data)
                if (index !== -1)
                    res = [
                        ...state.slice(0, index),
                        ...state.slice(index + 1)
                    ]
                else
                    res = [
                        ...state.splice(0, index),
                        action.data,
                        ...state.splice(index + 1)
                    ]
            }
            return res
        default:
    }
    return state
}

const historySelectedDates = (state = defaultState.historySelectedDates, action) => {
    switch (action.type) {
        case HISTORY_DATE_START:
            return { ...state, dateStart: action.data }
        case HISTORY_DATE_END:
            return { ...state, dateEnd: action.data }
        default:
    }
    return state
}

export default (state = defaultState, action) => ({
    historyId: historyId(state.historyId, action),
    historyData: historyData(state.historyData, action),
    historyOrder: historyOrder(state.historyOrder, action),
    historySkip: historySkip(state.historySkip, action),
    users: users(state.users, action),
    historyCategories: historyCategories(state.historyCategories, action),
    historySelectedCategories: historySelectedCategories(state.historySelectedCategories, action),
    historySelectedUsers: historySelectedUsers(state.historySelectedUsers, action),
    historySelectedDates: historySelectedDates(state.historySelectedDates, action),
})
