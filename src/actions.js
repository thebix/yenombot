import FileSystem from './lib/lib/fs'   // TODO: should be refactored

const fileSystem = new FileSystem()

export const BOT_CMD = 'BOT_CMD'
export const BOT_CMD_CLEAR = 'BOT_CMD_CLEAR'
export const BOT_BALANCE_MESSAGE_ID = 'BOT_BALANCE_MESSAGE_ID'

export const INIT_BY_TOKEN = 'INIT_BY_TOKEN'

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

export const USER_ADD = 'USER_ADD'

export const botCmd = (chatId, command, pars = {}) => ({
    type: BOT_CMD,
    chatId,
    command,
    pars
})

export const botCmdClear = chatId => ({
    type: BOT_CMD_CLEAR,
    chatId
})

export const setBotBalanceMessageId = (chatId, messageId) => ({
    type: BOT_BALANCE_MESSAGE_ID,
    messageId,
    chatId
})

export const initByToken = (chatId, token) => ({
    type: INIT_BY_TOKEN,
    chatId,
    token
})

export const balanceInit = (chatId, period) => ({
    type: BALANCE_INIT,
    chatId,
    period
})

export const balanceChange = (chatId, period, sub) => ({
    type: BALANCE_CHANGE,
    chatId,
    period,
    sub
})

const fileReadRequest = file => ({
    type: FS_FILE_READ,
    file
})

const fileReadDone = (file, data) => ({
    type: FS_FILE_READ_DONE,
    file,
    data
})

export const fileRead = file => dispatch => {
    dispatch(fileReadRequest(file))
    return fileSystem.getFile(file)
        .then(data => dispatch(fileReadDone(file, data)))
        .catch(() => {
            // TODO: обработка ошибки
        })
}

const fileSaveRequest = (file, data) => ({
    type: FS_FILE_WRITE,
    file,
    data
})

const fileSaveDone = file => ({
    type: FS_FILE_WRITE_DONE,
    file
})

export const fileSave = (file, data) => dispatch => {
    dispatch(fileSaveRequest(file, data))
    return fileSystem.saveFile(file, data)
        .then(() => dispatch(fileSaveDone(file)))
        .catch(() => {
            // TODO: обработка ошибки
        })
}

const jsonReadRequest = (file, id) => ({
    type: FS_JSON_READ,
    id
})

const jsonReadDone = (file, id, data) => ({
    type: FS_JSON_READ_DONE,
    id,
    file,
    data
})

export const jsonRead = (file, id) => dispatch => {
    dispatch(jsonReadRequest(file, id))
    return fileSystem.getJson(file)
        .then(data => dispatch(jsonReadDone(file, id, data)))
        .catch(() => {
            // TODO: обработка ошибки
        })
}

const jsonSaveRequest = (file, data) => ({
    type: FS_JSON_WRITE,
    file,
    data
})

const jsonSaveDone = file => ({
    type: FS_JSON_WRITE_DONE,
    file
})

export const jsonSave = (file, data) => dispatch => {
    dispatch(jsonSaveRequest(file, data))
    return fileSystem.saveJson(file, data)
        .then(() => dispatch(jsonSaveDone(file)))
        .catch(() => {
            // TODO: обработка ошибки
        })
}

export const userAdd = ({ id, firstName, lastName, username }) => ({
    type: USER_ADD,
    id,
    firstName,
    lastName,
    username
})
