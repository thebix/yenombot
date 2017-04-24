
export const BOT_CMD = 'BOT_CMD'
export const BOT_CMD_CLEAR = 'BOT_CMD_CLEAR'

export const BALANCE_CHANGE = 'BALANCE_CHANGE'

export const botCmd = (chatId, command) => {
    return {
        type: BOT_CMD,
        chatId,
        command
    }
}

export const botCmdClear = (chatId) => {
    return {
        type: BOT_CMD_CLEAR,
        chatId
    }
}


export const balanceChange = (chatId, sub) => {
    return {
        type: BALANCE_CHANGE,
        chatId,
        sub
    }
}