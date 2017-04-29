import { createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import FileSystem from './filesystem'

import { l, log, logLevel } from './logger'
import _config from './config'

import appReducer from './reducers'
import Telegram from './lib/telegram'

l('Start bot')

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
)
export let store = null

if (FileSystem.isDirExists(_config.dirStorage, true)
    && FileSystem.isFileExists(_config.fileState, true, false, '{}')) { //TODO: починить варнинг
    FileSystem.readJson(_config.fileState)
        .then(state => {
            state = state || {}
            l(state)
            store = createStore(appReducer, state, enhancer)
            new Telegram().listen()
                .then(() => {
                    l('🤖  Listening to incoming messages')
                })
        })
        .catch(x => {
            log(`Ошибка чтения файла прошлого состояния. err = ${x}`, logLevel.ERROR)
        })
}




