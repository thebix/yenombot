export default class Auth {
    getNeedDevStatus(message, bot) {
        // TODO: всплывающим сообщением
        bot.sendMessage(message.chat.id, `Доступ к чату есть только у разработчиков. Твоего id '${message.chat.id}' нет в конфигурации 🤖`)
    }
}
