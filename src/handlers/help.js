import { store } from '../server'
import { botCmd } from '../actions'
import _commands from '../enums/commands'

export default class Help {

    getHelp(message, bot, route) {
        store.dispatch(botCmd(message.chat.id, _commands.HELP))
        if (!route || route == 'help') {
            bot.sendMessage(message.chat.id, `Выбери категорию 🤖`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            {
                                text: `Категория 1`,
                                callback_data: `help/sub1`
                            }, {
                                text: `Категория 2`,
                                callback_data: `help/sub2`
                            }
                        ],
                        [{
                            text: `Категория 3`,
                            callback_data: `help/sub3`
                        }]
                    ]
                })
            })
            return
        }

        const buttonBack = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: `Назад`,
                            callback_data: `help`
                        }
                    ]
                ]
            })
        }
        switch (route) {
            case 'help/sub1':
                bot.sendMessage(message.chat.id, `Категория 1 хелп 🤖`, buttonBack)
                return
            case 'help/sub2':
                bot.sendMessage(message.chat.id, `Категория 2 хелп 🤖`, buttonBack)
                return
            case 'help/sub3':
                bot.sendMessage(message.chat.id, `Категория 3 хелп 🤖`, buttonBack)
                return
        }
        return
    }
}