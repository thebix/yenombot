import { createStore } from 'redux'

import { l } from './logger'

import appReducer from './reducers'
import Telegram from './lib/telegram'

l('Start bot')

export const store = createStore(appReducer, {})

new Telegram().listen()
    .then(() => {
        l('🤖  Listening to incoming messages')
    })
