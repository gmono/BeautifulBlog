"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var React = require("react");
var ReactDOM = require("react-dom");
var Item = /** @class */ (function (_super) {
    __extends(Item, _super);
    function Item(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            contentHeight: 0
        };
        return _this;
    }
    Item.prototype.componentDidMount = function () {
        console.log(ReactDOM.findDOMNode(this.refs.content).clientHeight);
        this.setState({
            contentHeight: ReactDOM.findDOMNode(this.refs.content).clientHeight
        });
    };
    Item.prototype.componentDidUpdate = function (prevprop, prevstate) {
        var h = ReactDOM.findDOMNode(this.refs.content).clientHeight;
        if (prevprop.isExpanded != this.props.isExpanded) {
            this.setState({
                contentHeight: h
            });
        }
    };
    Item.prototype.render = function () {
        var _a;
        var uexpstyle = {
            height: "100px",
            overflow: "hidden",
            transition: "all ease-out 1s"
        };
        var expstyle = {
            overflow: "hidden",
            transition: "all ease-in 1s",
            height: this.state.contentHeight + "px"
        };
        return (React.createElement("div", { style: {
                whiteSpace: "normal"
            }, className: "item" },
            React.createElement("div", { style: {
                    fontFamily: "微软雅黑",
                    fontSize: "xx-large",
                    cursor: "pointer"
                }, onClick: this.props.OnTitleClick }, this.props.info.title),
            React.createElement("hr", null),
            React.createElement("div", { style: {
                    color: "blue",
                    fontSize: "0.7em"
                } }, (_a = this.props.info.date) === null || _a === void 0 ? void 0 : _a.toString()),
            React.createElement("div", { style: this.props.isExpanded ? expstyle : uexpstyle, onClick: this.props.OnSummaryClick },
                React.createElement("div", { ref: "content", dangerouslySetInnerHTML: { __html: this.props.summary } }))));
    };
    return Item;
}(React.Component));
var ArticleItem = /** @class */ (function (_super) {
    __extends(ArticleItem, _super);
    function ArticleItem(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isExpanded: false,
            isloaded: false,
            info: null,
            html: null
        };
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
                }, summary: "\u52A0\u8F7D\u4E2D......", OnTitleClick: function () { }, OnSummaryClick: function () { }, isExpanded: this.state.isExpanded }));
        }
        else {
            return (React.createElement(Item, { info: this.state.info, summary: this.state.html, OnTitleClick: this.summarySwitch.bind(this), OnSummaryClick: function () { }, isExpanded: this.state.isExpanded }));
        }
    };
    return ArticleItem;
}(React.Component));
var ArticleList = /** @class */ (function (_super) {
    __extends(ArticleList, _super);
    function ArticleList(props) {
        return _super.call(this, props) || this;
    }
    ArticleList.prototype.render = function () {
        return (React.createElement("div", { style: {
                whiteSpace: "nowrap"
            } }, this.props.metalist.map(function (v) {
            return React.createElement("div", { key: v, style: {
                    display: "inline-block",
                    width: "80vw",
                    verticalAlign: "top"
                } },
                React.createElement(ArticleItem, { metapath: v, OnEnter: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        alert(JSON.stringify(args));
                    } }));
        })));
    };
    return ArticleList;
}(React.Component));
/**
 * 等宽容器，其会将自己的height设置为与scrollWidth相同 进而使其内容物都可以有同样的宽度
 */
var ScrollWidthContainer = /** @class */ (function (_super) {
    __extends(ScrollWidthContainer, _super);
    function ScrollWidthContainer(props) {
        return _super.call(this, props) || this;
    }
    ScrollWidthContainer.prototype.reset = function () {
        var ele = ReactDOM.findDOMNode(this.refs.top);
        if (ele instanceof HTMLElement) {
            ele.style.width = ele.scrollWidth + "px";
        }
        //暂时轮询解决
        setTimeout(this.reset.bind(this), 500);
    };
    ScrollWidthContainer.prototype.componentDidMount = function () {
        this.reset();
    };
    ScrollWidthContainer.prototype.componentDidUpdate = function (prevprop, prevstate) {
        // this.reset();
    };
    ScrollWidthContainer.prototype.render = function () {
        return (React.createElement("div", { ref: "top", style: this.props.style ? this.props.style : {} }, this.props.children));
    };
    return ScrollWidthContainer;
}(React.Component));
var SummaryItem = /** @class */ (function (_super) {
    __extends(SummaryItem, _super);
    function SummaryItem(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { mouseHover: false };
        return _this;
    }
    SummaryItem.prototype.render = function () {
        var _this = this;
        //生成css
        var css = {
            padding: "8px",
            cursor: "pointer",
            boxShadow: "0 0 1px 0 gray",
            marginTop: "8px",
            fontFamily: "微软雅黑"
        };
        if (this.state.mouseHover) {
            css.boxShadow = "0 0 5px 0 gray";
        }
        return (React.createElement("div", { style: css, onClick: this.props.onClick, onMouseEnter: function () { return _this.setState({ mouseHover: true }); }, onMouseLeave: function () { return _this.setState({ mouseHover: false }); } },
            React.createElement("div", { id: "title", style: {
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    marginBottom: "0.2rem",
                } }, this.props.title),
            React.createElement("div", { id: "summary", style: {
                    fontSize: "0.8em",
                    fontStyle: "italic",
                    color: "gray"
                } }, this.props.summary)));
    };
    return SummaryItem;
}(React.PureComponent));
var SummaryList = /** @class */ (function (_super) {
    __extends(SummaryList, _super);
    function SummaryList(props) {
        return _super.call(this, props) || this;
    }
    SummaryList.prototype.getList = function () {
        var _this = this;
        var itemlsit = [];
        var lst = this.props.filesInfo.fileList;
        var _loop_1 = function (key) {
            var item = lst[key];
            itemlsit.push(React.createElement(SummaryItem, { key: item.article_path, title: item.title, summary: "", onClick: function () {
                    //对外弹出事件
                    _this.props.onClick(key);
                } }));
        };
        for (var key in lst) {
            _loop_1(key);
        }
        return itemlsit;
    };
    SummaryList.prototype.render = function () {
        return (React.createElement("div", { style: {
                padding: "12px",
                boxShadow: "0 0 5px 1px black",
                background: "rgba(255, 255, 255, 0.781)",
            } }, this.getList()));
    };
    return SummaryList;
}(React.PureComponent));
var MainContainer = /** @class */ (function (_super) {
    __extends(MainContainer, _super);
    function MainContainer(props) {
        var _this = _super.call(this, props) || this;
        //初始信息为空
        _this.state = {
            data: {
                useConfig: "",
                fileList: {}
            }
        };
        return _this;
    }
    MainContainer.prototype.getCatalog = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, f;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.props.catalogPath)];
                    case 1:
                        r = _a.sent();
                        return [4 /*yield*/, r.json()];
                    case 2:
                        f = _a.sent();
                        //设置内部数据
                        this.setState({
                            data: f
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    MainContainer.prototype.getMetaList = function () {
        //从中提取出文件列表和文章元数据url列表
        var s = this.state.data.fileList;
        var ss = [];
        for (var k in s) {
            ss.push(k);
        }
        return ss;
    };
    MainContainer.prototype.componentDidMount = function () {
        this.getCatalog();
    };
    MainContainer.prototype.componentDidUpdate = function (prevprop, prevstate) {
        if (prevprop.catalogPath != this.props.catalogPath) {
            this.getCatalog();
        }
    };
    MainContainer.prototype.listClick = function (key) {
        alert(key);
        //这里进行content 的scroll操作
        var ele = ReactDOM.findDOMNode(this.refs.content);
        if (ele instanceof Element) {
            //这里要滚动到某个元素位置
        }
    };
    MainContainer.prototype.render = function () {
        //侧边栏加内容区
        //左边为summarylist
        //content内容待定
        //暂时全部用自动适配子元素宽度的容器代替div
        return (React.createElement(ScrollWidthContainer, { style: {
                display: "flex",
            } },
            React.createElement("div", { ref: "left", style: {
                    flex: "1"
                } },
                React.createElement(SummaryList, { filesInfo: this.state.data, onClick: this.listClick.bind(this) })),
            React.createElement("div", { ref: "content", style: {
                    flex: "5",
                    overflow: "scroll"
                } },
                React.createElement(ArticleList, { metalist: this.getMetaList() }))));
    };
    return MainContainer;
}(React.Component));
//暂时不适用上面的容器 性能问题 直接设置fixed
var Page = (React.createElement(ScrollWidthContainer, { style: {
        backgroundImage: "url(./back.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "color-burn",
        backgroundOrigin: "border-box",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
    } },
    React.createElement("div", { style: {
            margin: "0",
            marginBottom: "1rem",
            padding: "2rem",
        } },
        React.createElement("h1", null, "\u6211\u7684\u535A\u5BA2"),
        React.createElement("h3", null, "\u70B9\u51FB\u6807\u9898\u5C55\u5F00")),
    React.createElement("hr", { style: { marginBottom: "30px" } }),
    React.createElement(MainContainer, { catalogPath: "../content/files.json" })));
ReactDOM.render(Page, document.querySelector("#page"));
