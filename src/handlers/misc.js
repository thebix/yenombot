export default class Misc {
    getEcho(message, bot) {
        bot.sendMessage(message.from, `${message.text} 🤖`)
    }
}
