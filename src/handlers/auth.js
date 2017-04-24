export default class Auth {
    constructor() { }

    getNeedDevStatus(message, bot) {
        bot.sendMessage(message.from, `Доступ к чату есть только у разработчиков. Твоего id '${message.from}' нет в конфигурации 🤖`)
    }
}