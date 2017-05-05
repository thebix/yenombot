import { createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import FileSystem from './lib/filesystem'
import History from './lib/history'

import { l, log, logLevel } from './logger'
import _config from './config'

import appReducer from './reducers'
import Telegram from './lib/telegram'

log('Start bot', logLevel.INFO)

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
)
export let store = null
export const history = new History(_config.dirStorage, 'balance-hist-${id}.json')

if (FileSystem.isDirExists(_config.dirStorage, true)
    && FileSystem.isFileExists(_config.fileState, true, false, '{}')) { //TODO: починить варнинг
    FileSystem.readJson(_config.fileState)
        .then(state => {
            state = state || {}
            store = createStore(appReducer, state, enhancer)
            new Telegram().listen()
                // .then((data) => {
                //     l('🤖  Listening to incoming messages')
                // })
                // .catch(ex => log(ex, logLevel.ERROR))
        })
        .catch(x => {
            log(`Ошибка чтения файла прошлого состояния. err = ${x}`, logLevel.ERROR)
        })
}


