"use strict";
//钩子系统 会被server端程序调用 当
var Hooks = /** @class */ (function () {
    function Hooks() {
    }
    Hooks.prototype.beforeUnload = function (context) {
        console.log("unloading");
    };
    Hooks.prototype.install = function (context, installName) {
    };
    Hooks.prototype.uninstall = function (context, installName) {
    };
    Hooks.prototype.loaded = function (context) {
        console.log("loaded");
    };
    Hooks.prototype.generated = function (context) {
        console.log("generated");
    };
    Hooks.prototype.articleChanged = function (context, type, dest) {
    };
    return Hooks;
}());
module.exports = new Hooks();
