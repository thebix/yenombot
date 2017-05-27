"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} // https://core.telegram.org/bots/api#user
var Message = function () {
    function Message(msg) {_classCallCheck(this, Message);
        this.id = msg.id;
        this.from = msg.from;
        this.text = msg.text;
        this.user = msg.user;
        this.chat = msg.chat;
    }_createClass(Message, null, [{ key: "mapMessage", value: function mapMessage(

        msg) {
            return {
                id: msg.message_id,
                from: msg.from.id,
                text: msg.text,
                user: {
                    id: msg.from.id,
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name,
                    username: msg.from.username },

                chat: {
                    id: msg.chat.id,
                    type: msg.chat.type,
                    title: msg.chat.title,
                    username: msg.chat.username,
                    firstName: msg.chat.first_name,
                    lastName: msg.chat.last_name,
                    allMembersAdmins: msg.chat.all_members_are_administrators } };


        } }]);return Message;}();exports.default = Message;