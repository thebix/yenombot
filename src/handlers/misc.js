export default class Misc {
    constructor() { }

    getEcho(message, bot) {
        bot.sendMessage(message.from, `${message.text} 🤖`)
    }
}