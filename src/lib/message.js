// https://core.telegram.org/bots/api#user
export default class Message {
    constructor(msg) {
        this.id = msg.id
        this.from = msg.from
        this.text = msg.text
        this.user = msg.user
        this.chat = msg.chat
    }

    static mapMessage(msg) {
        return {
            id: msg.message_id,
            from: msg.from.id,
            text: msg.text,
            user: {
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                username: msg.from.username
            },
            chat: {
                id: msg.chat.id,
                type: msg.chat.type,
                title: msg.chat.title,
                username: msg.chat.username,
                firstName: msg.chat.first_name,
                lastName: msg.chat.last_name,
                allMembersAdmins: msg.chat.all_members_are_administrators
            }
        }
    }
}