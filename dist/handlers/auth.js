"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Auth = function () {
    function Auth() {
        _classCallCheck(this, Auth);
    }

    _createClass(Auth, [{
        key: "getNeedDevStatus",
        value: function getNeedDevStatus(message, bot) {
            //TODO: всплывающим сообщением
            bot.sendMessage(message.chat.id, "\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u0447\u0430\u0442\u0443 \u0435\u0441\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0443 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u043E\u0432. \u0422\u0432\u043E\u0435\u0433\u043E id '" + message.chat.id + "' \u043D\u0435\u0442 \u0432 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \uD83E\uDD16");
        }
    }]);

    return Auth;
}();

exports.default = Auth;