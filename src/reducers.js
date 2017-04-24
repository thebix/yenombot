import _token from './token'

import { l } from './logger'

import {
    BOT_CMD,
    BOT_CMD_CLEAR,

    BALANCE_CHANGE
} from './actions'

const defaultState = {
    command: {
        ['chatId']: ''
    },
    balance: {
        ['chatId']: _token.balanceInit
    }
}

const command = (state = defaultState.command, action) => {
    switch (action.type) {
        case BOT_CMD:
            return Object.assign({}, state, {
                [action.chatId]: action.command
            })
        case BOT_CMD_CLEAR:
            return Object.assign({}, state, {
                [action.chatId]: ''
            })
    }
    return state
}  

const balance = (state = defaultState.balance, action) => {
    switch (action.type) {
        case BALANCE_CHANGE:
            const balance = Object.keys(state).some(x => x == action.chatId)
                ? state[action.chatId] - action.sub
                : _token.balanceInit - action.sub
            return Object.assign({}, state, {
                [action.chatId]: balance
            })
    }
    return state
}

export default (state, action) => {
    return {
        command: command(state.command, action),
        balance: balance(state.balance, action)
    }
}