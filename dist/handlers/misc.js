"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Misc = function () {
    function Misc() {
        _classCallCheck(this, Misc);
    }

    _createClass(Misc, [{
        key: "getEcho",
        value: function getEcho(message, bot) {
            bot.sendMessage(message.from, message.text + " \uD83E\uDD16");
        }
    }]);

    return Misc;
}();

exports.default = Misc;