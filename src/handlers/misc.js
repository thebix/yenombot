export default class Misc {
    constructor() { }

    getEcho(message, bot) {
        bot.sendMessage(message.from, `${message.text} 🤖`)
    }

    getHelp(message, bot) {
        bot.sendMessage(message.from, '//TODO: help')
    }
}