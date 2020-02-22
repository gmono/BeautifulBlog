"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//钩子系统 会被server端程序调用 当
var Hooks = /** @class */ (function () {
    function Hooks() {
    }
    Hooks.prototype.init = function (context) {
    };
    Hooks.prototype.OnSiteChanged = function () {
        throw new Error("Method not implemented.");
    };
    Hooks.prototype.OnAllGenerated = function () {
        throw new Error("Method not implemented.");
    };
    Hooks.prototype.OnArticleChange = function (type, changelist) {
        if (changelist === void 0) { changelist = ("../../app/Interface/IContentMeta").IContentMeta[]; }
        throw new Error("Method not implemented.");
    };
    return Hooks;
}());
exports.default = new Hooks();
