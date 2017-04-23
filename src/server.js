import { l } from './logger'

import Telegram from './lib/telegram'

l('Start bot')

new Telegram().listen()
    .then(() => {
        l('🤖  Listening to incoming messages')
    })