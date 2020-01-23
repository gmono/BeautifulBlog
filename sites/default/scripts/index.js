"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as React from "react"
// import * as ReactDOM from "react-dom"
var React;
var ReactDOM;
var Item = function (props) {
    return (React.createElement("div", { onClick: props.OnTitleClick, className: "item" },
        React.createElement("div", null, props.info.title),
        React.createElement("div", { style: {
                color: "blue",
                fontSize: "0.7em"
            } }, props.info.date),
        React.createElement("div", null,
            props.summary,
            React.createElement("span", { style: {
                    color: "pink",
                    fontSize: "0.8em",
                    fontWeight: "bold"
                } }, props.isExpanded ? "收起" : "展开"))));
};
var ArticleItem = /** @class */ (function (_super) {
    __extends(ArticleItem, _super);
    function ArticleItem(props) {
        var _this = _super.call(this, props) || this;
        _this.setState({
            isExpanded: false,
            isloaded: false
        });
        return _this;
    }
    ArticleItem.prototype.loadArticle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, json, hpath, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.props.metapath)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = _a.sent();
                        hpath = this.props.metapath.replace(/.json$/, ".html");
                        return [4 /*yield*/, fetch(hpath)];
                    case 3: return [4 /*yield*/, (_a.sent()).text()];
                    case 4:
                        html = _a.sent();
                        this.setState({
                            info: json,
                            html: html,
                            isloaded: true
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ArticleItem.prototype.componentDidMount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadArticle()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ArticleItem.prototype.componentDidUpdate = function (prevProps, prevState) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(prevProps.metapath != this.props.metapath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadArticle()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ArticleItem.prototype.summarySwitch = function () {
        this.setState({
            isExpanded: !(this.state.isExpanded)
        });
    };
    ArticleItem.prototype.enterArticle = function () {
        //进入此篇文章
        //内容地址
        var hpath = this.props.metapath.replace(/.json$/, ".html");
        this.props.OnEnter(this.state.info, this.state.html, this.props.metapath, hpath);
    };
    ArticleItem.prototype.render = function () {
        if (!(this.state.isloaded)) {
            return (React.createElement(Item, { info: {
                    title: "加载中",
                    article_length: 0,
                    content_length: 0,
                    date: new Date(),
                    article_path: "未知",
                    from_dir: [],
                    modify_time: new Date()
                }, summary: "加载中......", OnTitleClick: function () { }, OnSummaryClick: this.summarySwitch.bind(this), isExpanded: this.state.isExpanded }));
        }
        else {
            return (React.createElement(Item, { info: this.state.info, summary: this.state.html.slice(0, 300) + "......", OnTitleClick: this.enterArticle.bind(this), OnSummaryClick: this.summarySwitch.bind(this), isExpanded: this.state.isExpanded }));
        }
    };
    return ArticleItem;
}(React.Component));
ReactDOM.render(React.createElement(ArticleItem, { metapath: "/content/about.json", OnEnter: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        alert(JSON.stringify(args));
    } }), document.querySelector("div"));
