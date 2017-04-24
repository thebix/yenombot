import FileSystem from './filesystem'


export const BOT_CMD = 'BOT_CMD'
export const BOT_CMD_CLEAR = 'BOT_CMD_CLEAR'

export const BALANCE_INIT = 'BALANCE_INIT'
export const BALANCE_CHANGE = 'BALANCE_CHANGE'

export const FS_FILE_READ = 'FS_FILE_READ'
export const FS_FILE_READ_DONE = 'FS_FILE_READ_DONE'
export const FS_FILE_WRITE = 'FS_FILE_WRITE'
export const FS_FILE_WRITE_DONE = 'FS_FILE_WRITE_DONE'
export const FS_JSON_READ = 'FS_JSON_READ'
export const FS_JSON_READ_DONE = 'FS_JSON_READ_DONE'
export const FS_JSON_WRITE = 'FS_JSON_WRITE'
export const FS_JSON_WRITE_DONE = 'FS_JSON_WRITE_DONE'

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


export const balanceInit = (chatId, period) => {
    return {
        type: BALANCE_INIT,
        chatId,
        period
    }
}

export const balanceChange = (chatId, period, sub) => {
    return {
        type: BALANCE_CHANGE,
        chatId,
        period,
        sub

    }
}


const fileReadRequest = (file) => {
    return {
        type: FS_FILE_READ
    }
}

const fileReadDone = (file, data) => {
    return {
        type: FS_FILE_READ_DONE,
        file,
        data
    }
}

export const fileRead = (file) => {
    return dispatch => {
        dispatch(fileReadRequest(file))
        FileSystem.getFile(file)
            .then(data => dispatch(fileReadDone(file, data)))
            .catch(err => {
                //TODO: обработка ошибки
            })
    }
}

const fileSaveRequest = (file, data) => {
    return {
        type: FS_FILE_WRITE,
        file,
        data
    }
}

const fileSaveDone = (file) => {
    return {
        type: FS_FILE_WRITE_DONE,
        file
    }
}

export const fileSave = (file, data, type) => {
    return dispatch => {
        dispatch(fileSaveRequest(file, data))
        FileSystem.saveFile(file, data)
            .then(data => dispatch(fileSaveDone(file)))
            .catch(err => {
                //TODO: обработка ошибки
            })
    }
}

const jsonReadRequest = (file, id) => {
    return {
        type: FS_JSON_READ
    }
}

const jsonReadDone = (file, id, data) => {
    return {
        type: FS_JSON_READ_DONE,
        id,
        file,
        data
    }
}

export const jsonRead = (file, id) => {
    return dispatch => {
        dispatch(jsonReadRequest(file, id))
        FileSystem.getJson(file)
            .then(data => dispatch(jsonReadDone(file, id, data)))
            .catch(err => {
                //TODO: обработка ошибки
            })
    }
}

const jsonSaveRequest = (file, data) => {
    return {
        type: FS_JSON_WRITE,
        file,
        data
    }
}

const jsonSaveDone = (file) => {
    return {
        type: FS_JSON_WRITE_DONE,
        file
    }
}

export const jsonSave = (file, data) => {
    return dispatch => {
        dispatch(jsonSaveRequest(file, data))
        FileSystem.saveJson(file, data)
            .then(data => dispatch(jsonSaveDone(file)))
            .catch(err => {
                //TODO: обработка ошибки
            })
    }
}