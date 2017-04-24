import {
    BOT_CMD,
    BOT_CMD_CLEAR
} from './actions'

const defaultState = {
    command: {
        ['chatId']: ''
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

export default (state, action) => {
    return {
        command: command(state, action)
    }
}