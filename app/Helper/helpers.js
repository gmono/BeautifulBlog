var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var EventHub = /** @class */ (function () {
    function EventHub() {
        this.cbks = [];
    }
    /**
     * register
     */
    EventHub.prototype.register = function (cbk) {
        this.cbks.push(cbk);
    };
    EventHub.prototype.send = function (pars) {
        this.cbks.forEach(function (v) {
            v(pars);
        });
    };
    return EventHub;
}());
/**
 * 组 id和组件名约定 *代表未知  sys代表系统 其他自定义
 */
var MessageHub = /** @class */ (function () {
    function MessageHub() {
        this.id_lst = [];
        //id->MessageClient
        this.id_map = {};
    }
    MessageHub.prototype.send = function (id, selfid, obj) {
        this.getClient(id).Source.send({
            sender: selfid,
            typeid: "custom",
            data: obj
        });
    };
    MessageHub.prototype.getClient = function (id) {
        if (id in this.id_map)
            return this.id_map[id];
        return null;
    };
    MessageHub.prototype.register = function (client) {
        client.Core = this;
        if (client.id in this.id_map)
            return false;
        this.id_lst.push(client.id);
        this.id_map[client.id] = client;
    };
    return MessageHub;
}());
/**
 * 基本Message客户端，只负责传递消息，不解释data的含义
 * 提供基本的对特定组件/组/id 发送消息的功能
 * 提供组件自身的基本信息 包括自身的id 组件name 和组id
 * 允许客户端获取只读Core对象并使用其与全局交互
 */
var MessageClient = /** @class */ (function () {
    function MessageClient(core, id, componentname, groupid) {
        if (componentname === void 0) { componentname = "*"; }
        if (groupid === void 0) { groupid = "*"; }
        this.core = core;
        this.id = id;
        this.componentname = componentname;
        this.groupid = groupid;
        this.sendids = null;
        /**
         * 事件Hub 允许组件监听事件
         */
        this.Source = new EventHub();
        this.sendids = core.id_lst;
    }
    Object.defineProperty(MessageClient.prototype, "Core", {
        get: function () {
            return this.core;
        },
        set: function (value) {
            this.core = value;
            this.sendids = this.core.id_lst;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 直接调用等于广播消息
     * @param obj 发送的对象
     */
    MessageClient.prototype.send = function (obj) {
        var _this = this;
        this.sendids.forEach(function (value, idx) {
            _this.core.send(value, _this.id, obj);
        });
    };
    MessageClient.prototype.group = function (groupid) {
        var _this = this;
        var ret = new MessageClient(this.core, this.id, this.componentname, this.groupid);
        ret.sendids = this.sendids.filter(function (value, idx) {
            if (_this.core.getClient(value).groupid == groupid)
                return true;
            return false;
        });
        return ret;
    };
    MessageClient.prototype.component = function (componentname) {
        var _this = this;
        var ret = new MessageClient(this.core, this.id, this.componentname, this.groupid);
        ret.sendids = this.sendids.filter(function (value, idx) {
            if (_this.core.getClient(value).componentname == componentname)
                return true;
            return false;
        });
        return ret;
    };
    MessageClient.prototype.ids = function () {
        var _this = this;
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        var ret = new MessageClient(this.core, this.id, this.componentname, this.groupid);
        //过滤不存在的
        ret.sendids = ids.filter(function (value, idx) {
            if (_this.core.getClient(value) != null)
                return true;
            return false;
        });
        ;
        return ret;
    };
    MessageClient.prototype.except = function () {
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        var ret = new MessageClient(this.core, this.id, this.componentname, this.groupid);
        //过滤不存在的
        ret.sendids = this.sendids.filter(function (value, idx) {
            //如果在排除列表
            if (ids.indexOf(value) != -1)
                return false;
            return true;
        });
        ;
        return ret;
    };
    MessageClient.prototype.exceptSelf = function () {
        return this.except(this.id);
    };
    return MessageClient;
}());
/**
 * 监听器组件相关
 */
var Watcher;
(function (Watcher_1) {
    var a = {};
    //消息中心
    function MessageCbk(obj) {
        console.log("changed:" + JSON.stringify(obj));
    }
    function Changed(obj) {
        //发出更改消息并冒泡
        //发出此对象更改消息
        MessageCbk(obj);
        //发出parent更改消息
        if (obj[Watcher_1.Parent] != null)
            Changed(obj[Watcher_1.Parent]);
    }
    ///
    Watcher_1.Parent = Symbol("父对象的代理对象的指针");
    Watcher_1.SelfName = Symbol("此对象在父对象中的属性名，如果有");
    Watcher_1.NoProxy = Symbol("表明此对象不需要Proxy化");
    Watcher_1.NoEvent = Symbol("表明此对象不监听更改事件");
    /**
     * 辅助函数，用于打印一个对象相对top对象的path 前提是这个top对象必须是被代理的
     * @param obj 打印的对象
     */
    function printChain(obj) {
        //获得parent对象并打印parent对象的信息
        var parent = obj[Watcher_1.Parent];
        if (parent != null)
            printChain(parent);
        //打印自己的信息
        console.log(obj);
    }
    ///基本读写函数区域
    /**
     * 进行自定义的属性设置，允许对proxy行为进行控制
     * @param obj 要设置属性的对象
     * @param key 属性名
     * @param value 属性值
     * @param noevent 是否不触发事件
     * @param noproxy 是否不进行递归代理（针对新设置的属性）
     */
    function setObject(obj, key, value, noevent, noproxy) {
        if (noevent === void 0) { noevent = false; }
        if (noproxy === void 0) { noproxy = false; }
        var nobj = value;
        obj[Watcher_1.NoEvent] = noevent;
        if (typeof value == "object")
            nobj[Watcher_1.NoProxy] = noproxy;
        obj[key] = nobj;
        delete obj[Watcher_1.NoEvent];
        if (typeof value == "object")
            delete nobj[Watcher_1.NoProxy];
    }
    /**
     *
     * @param obj 要获取属性的对象
     * @param path 路径
     * @param ensure 当path指定的属性不存在时是否进行ensure操作，即创建一个新属性
     * @param noevent 是否触发修改事件
     * @param noproxy 是否需要对新属性进行递归代理
     */
    function getPathPtr(obj, path, ensure, noevent, noproxy) {
        var e_1, _a;
        if (ensure === void 0) { ensure = false; }
        if (noevent === void 0) { noevent = false; }
        if (noproxy === void 0) { noproxy = false; }
        var arr = path.split("/").slice(1);
        var npth = arr.slice(0, -1);
        var prop = arr[arr.length - 1];
        var now = obj;
        try {
            for (var npth_1 = __values(npth), npth_1_1 = npth_1.next(); !npth_1_1.done; npth_1_1 = npth_1.next()) {
                var p = npth_1_1.value;
                if (now[p] == null) {
                    if (ensure) {
                        setObject(now, p, {}, noevent, noproxy);
                    }
                    else
                        throw "错误，路径不存在";
                }
                now = now[p];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (npth_1_1 && !npth_1_1.done && (_a = npth_1.return)) _a.call(npth_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return { obj: now, prop: prop };
    }
    /////结束
    //确认path存在 如果不存在抛出错误
    Watcher_1.ensuerPathExists = function (obj, path) { getPathPtr(obj, path); };
    ///应用读写函数
    //根据path设置属性
    function setProp(obj, path, value, force, noevent, noproxy) {
        if (force === void 0) { force = false; }
        if (noevent === void 0) { noevent = false; }
        if (noproxy === void 0) { noproxy = false; }
        var res = getPathPtr(obj, path, force, noevent, noproxy);
        setObject(res.obj, res.prop, value, noevent, noproxy);
        //返回的是有Proxy的对象或值
        return res.obj[res.prop];
    }
    Watcher_1.setProp = setProp;
    /**
     * 根据path获取属性
     * @param obj 获取属性
     * @param path 路径
     */
    function getProp(obj, path) {
        if (path == "/")
            return obj;
        var res = getPathPtr(obj, path);
        return res.obj[res.prop];
    }
    Watcher_1.getProp = getProp;
    ///查询函数
    /**
     * 分析对象，得到其top对象和相对于top对象的path
     * @param obj 要分析的对象
     */
    function getTopAndPath(obj) {
        var nowpath = "";
        var now = obj;
        while (now[Watcher_1.Parent] != null) {
            nowpath = "/" + now[Watcher_1.SelfName] + nowpath;
            now = now[Watcher_1.Parent];
        }
        if (nowpath == "")
            nowpath = "/";
        return { top: now, nowpath: nowpath };
    }
    Watcher_1.getTopAndPath = getTopAndPath;
    /**
     * 获取一个object自带的路径
     * 追溯Parent获取obj相对顶层对象的路径
     * @param obj 要获取路径的对象
     */
    function getPath(obj) {
        return getTopAndPath(obj).nowpath;
    }
    Watcher_1.getPath = getPath;
    //正文开始
    /**
     * 正文开始
     * 使用方法 let obj=new Watcher(handler).toProxiedData(obj);
     */
    var Watcher = /** @class */ (function () {
        /**
         * @param Handler 通知函数
         * @param isBubble 是否采用事件冒泡（即下层对象修改后，上层对象会接到通知)
         */
        function Watcher(Handler, isBubble) {
            if (isBubble === void 0) { isBubble = true; }
            this.Handler = Handler;
            this.isBubble = isBubble;
            //指示是否暂停发出Change事件
            this.isListen = true;
            this.ProxyObject = null;
            var _this = this;
            var pobj = {
                set: function (target, p, value, receiver) {
                    //只要有属性更改就加个代理
                    if (p == Watcher_1.NoProxy && p == Watcher_1.NoEvent) {
                        target[p] = value;
                        return true;
                    }
                    var desc = Object.getOwnPropertyDescriptor(target, p);
                    if (p in target && (desc == null || desc.writable == false)) {
                        //不代理只读对象
                        return true;
                    }
                    var old = target[p];
                    if (typeof value == 'object' && value[Watcher_1.NoProxy] != true) {
                        //如果此处在修改一个对象的parent，则会导致parent对象被加上Proxy
                        //这使得Parent对象本身的更改也会被此对象监听(重复设置Proxy)
                        //同时下面的代码设置Parent的Parent指针指向此对象导致“循环指向” 出错
                        //因此Parent对象是只读且不可修改的
                        var childProxy = new Proxy(value, pobj);
                        target[p] = childProxy;
                        //在目标对象上记录下parent指针 parent可以为父对象的proxy或直接为对象本身
                        //在value上记录parent则parent的更改不被监视  否则将形成无限递归
                        //即在子对象上记录parent时等同于给子对象加了一个属性
                        //这个属性又需要以子对象为parent 以此类推
                        //故parent不通过代理
                        //value为receiver表示parent指向的是Parent的Proxy对象,因此对其parent的操作
                        //也会被监视
                        Object.defineProperty(value, Watcher_1.Parent, {
                            value: receiver,
                            enumerable: false,
                            writable: false,
                            configurable: false
                        });
                        //记录此对象在父对象中的属性名
                        Object.defineProperty(value, Watcher_1.SelfName, {
                            value: p,
                            enumerable: false,
                            writable: false,
                            configurable: false
                        });
                    }
                    else {
                        target[p] = value;
                    }
                    if (_this.isListen && target[Watcher_1.NoEvent] != true) {
                        // printChain(target);
                        //通知
                        _this.Changed(receiver, {
                            old: old,
                            new: target[p]
                        }, "/" + String(p));
                    }
                    return true;
                }
            };
            this.ProxyObject = pobj;
        }
        //target中的old和new 都是Proxied对象或值
        Watcher.prototype.Changed = function (obj, target, targetPath) {
            this.Handler({ obj: obj, target: target, targetPath: targetPath });
            //如果冒泡且存在父对象才继续递归
            if (this.isBubble && obj[Watcher_1.Parent] != null)
                this.Changed(obj[Watcher_1.Parent], target, "/" + String(obj[Watcher_1.SelfName]) + targetPath);
        };
        /**
         * 应该遵循自顶向下逐层赋值的原则
         * parent已经是Proxy对象或直接为null
         * 转换原始对象 直接在原始对象上转换
         * @param obj 要转换的对象
         * @param parent 父对象（将被赋值给父对象）可以为Proxy化的对象
         * @param key 此对象在父对象中的属性名
         */
        Watcher.prototype.toProxiedData = function (obj, parent, key) {
            if (parent === void 0) { parent = null; }
            if (key === void 0) { key = ""; }
            try {
                var ret = null;
                //如果父对象不存在 则ret直接为obj的代理
                obj[Watcher_1.NoEvent] = true;
                if (parent == null)
                    ret = new Proxy(obj, this.ProxyObject);
                else {
                    //赋值给父对象
                    parent[key] = obj;
                    //从父对象中得到处理过的子对象
                    ret = parent[key];
                }
                //处理下级对象 转换所有object
                for (var key_1 in obj) {
                    if (obj[key_1] != null && typeof obj[key_1] == "object")
                        this.toProxiedData(obj[key_1], ret, key_1);
                }
                //为避免触发读取事件 这里直接操作原始对象
                delete obj[Watcher_1.NoEvent];
                return ret;
            }
            catch (e) {
                return obj;
            }
        };
        return Watcher;
    }());
    Watcher_1.Watcher = Watcher;
    /**
     * 写入器 接受更改信息 对监控对象进行修改
     */
    var Writer = /** @class */ (function () {
        function Writer() {
        }
        return Writer;
    }());
    Watcher_1.Writer = Writer;
})(Watcher || (Watcher = {}));
var core = new MessageHub();
if (window.core != null)
    core = window.core;
//组件化基本程序
function getcode(txt) {
    var first = txt.indexOf("{");
    var last = txt.lastIndexOf("}");
    return txt.substring(first + 1, last);
}
/**
 * 调用代理工厂
 */
function getCallProxy(_this) {
    return function (func) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return func.apply(_this, args);
    }; };
}
function thisApply(proxyobj, thisobj) {
    var retobj = {};
    var callproxy = getCallProxy(thisobj);
    for (var k in proxyobj) {
        if (proxyobj[k] instanceof Function)
            retobj[k] = callproxy(proxyobj[k]);
        else
            retobj[k] = proxyobj[k];
    }
    return retobj;
}
/**
 * 加载一个页面到节点中（页面包括html文本和script)
 * @param root 挂载的根节点
 * @param text html页面的文本
 * @param script html页面的script
 * @param modsign 用于表示此次加载的sign
 */
function loadPage(root, text, script, modsign, name, props) {
    if (name === void 0) { name = "*"; }
    if (props === void 0) { props = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            props = __assign(__assign({}, props), { root: root });
            root.innerHTML = text;
            //在html加载完成后执行的代码
            setTimeout(function () {
                var rootjq = $(root);
                //构造查询函数
                var jqfunc = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return rootjq.find.apply(rootjq, __spread(args));
                };
                //代理window对象
                var window_proxy = {
                    onload: null
                };
                var pwindow = new Proxy(window, {
                    get: function (target, p, receiver) {
                        if (p in window_proxy)
                            return window_proxy[p];
                        return target[p];
                    },
                    set: function (target, p, value, receiver) {
                        //置换各种事件
                        if (p in window_proxy)
                            window_proxy[p] = value;
                        else {
                            console.log("组件尝试非法写入");
                            return false;
                        }
                        return true;
                    }
                });
                //构造部分只读和代理的document 以下函数都会被在document上调用
                var document_proxy = {
                    getElementById: function (id) {
                        return pars.$("#" + id)[0];
                    },
                    createElement: function (tagname) {
                        var ele = document.createElement(tagname);
                        //添加组件标志
                        ele.setAttribute("data-sign", modsign);
                        return ele;
                    }
                };
                var document_call_proxy = getCallProxy(document);
                //代理文档
                var pdocument = new Proxy(document, {
                    get: function (target, p, receiver) {
                        //如果p在root节点上有 比如query等 则直接返回
                        if (p in root) {
                            if (root[p] instanceof Function)
                                return function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    return root[p].apply(root, __spread(args));
                                };
                            return root[p];
                        }
                        else if (p in document_proxy) {
                            //如果document代理上有优先使用代理函数
                            if (document_proxy[p] instanceof Function)
                                return document_call_proxy(document_proxy[p]);
                            else
                                return document_proxy[p];
                        }
                        else
                            return target[p];
                    },
                    set: function (target, p, value, receiver) {
                        console.log("组件尝试非法写入");
                        return true;
                    }
                });
                //d3 代理
                //d3代理对象 用于模拟完整的全局d3 对象
                var d3proxy_obj = thisApply({
                    selectAll: function (selector) {
                        if (typeof selector == "string")
                            return d3.select(root).selectAll(selector);
                        else
                            return d3.selectAll(selector);
                    }
                }, d3.select(root));
                var d3proxy = new Proxy(d3, {
                    get: function (target, p, receiver) {
                        var rootd3 = d3.select(root);
                        if (p in d3proxy_obj)
                            return d3proxy_obj[p];
                        if (p in rootd3)
                            return rootd3[p];
                        return d3[p];
                    },
                    set: function (target, p, value, receiver) {
                        //禁止写入
                        return false;
                    }
                });
                //页面主函数参数
                //这里jq和document创建节点时放上sign
                var client = new MessageClient(core, modsign, name);
                core.register(client);
                var pars = {
                    $: jqfunc,
                    window: pwindow,
                    document: pdocument,
                    msghub: client,
                    d3: d3proxy
                };
                //执行代码
                var evalfunc = function (_a) {
                    var $ = _a.$, window = _a.window, document = _a.document, msghub = _a.msghub, d3 = _a.d3;
                    eval(script);
                };
                evalfunc(pars);
                //处理后续操作（触发各种事件等）
                //调用onload
                setTimeout((function () {
                    var $ = pars.$, window = pars.window, document = pars.document, msghub = pars.msghub, d3 = pars.d3;
                    window_proxy.onload && window_proxy.onload();
                }), 0);
            }, 0);
            return [2 /*return*/];
        });
    });
}
//得到容器
function getContainer(root) {
    var cont = document.createElement("div");
    cont.style.position = "relative";
    cont.style.height = cont.style.width = "100%";
    root.appendChild(cont);
    return cont;
}
//自定义的组件加载
function getTrans(baseurl) {
    var _this_1 = this;
    if (baseurl === void 0) { baseurl = new URL(window.location.href).pathname; }
    var compsum = 0;
    var compontentTrans = function (modsign, text) { return function (tree) { return __awaiter(_this_1, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    window.treeapis.ApiSet(tree, "first");
                    return [4 /*yield*/, tree.match({ tag: "component" }, function (p) {
                            if (typeof p == "string")
                                return p;
                            var src = p.attrs["src"];
                            //执行代码得到对象
                            var propscode = "{}";
                            if ("props" in p.attrs)
                                propscode = p.attrs["props"];
                            src = join(baseurl, src);
                            console.log(src);
                            p.tag = "div";
                            p.attrs["id"] = "__component__" + compsum;
                            var script = {
                                tag: "script",
                                attrs: [],
                                content: ["loadFile(document.getElementById(\"__component__" + compsum + "\"),\"" + src + "\"," + propscode + ");"]
                            };
                            compsum++;
                            return [p, script];
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }; };
    return compontentTrans;
}
/**
 * 加载文件到节点中作为组件
 * @param root 加载的根节点
 * @param url 加载的文件路径
 * @param props 组件属性对象（在组件内以props引用）
 * @param mdsign 自定义组件标识，用于纯粹内容加载时提供相同的sign或者对特殊部件提供特定的sign做id
 */
function loadFile(root, url, props, mdsign) {
    if (props === void 0) { props = {}; }
    if (mdsign === void 0) { mdsign = null; }
    return __awaiter(this, void 0, void 0, function () {
        var ele, res, text, _a, html, script, modsign;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    //处理root 取得相对容器
                    root = getContainer(root);
                    ele = root;
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    res = _b.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 2:
                    text = _b.sent();
                    return [4 /*yield*/, (mdsign == null ? window.pack(text, [getTrans()]) : window.pack(text, [getTrans()], [], mdsign))];
                case 3:
                    _a = _b.sent(), html = _a.html, script = _a.script, modsign = _a.modsign;
                    loadPage(ele, html, script, modsign, url, props);
                    return [2 /*return*/, modsign];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
var CHAR_FORWARD_SLASH = 47;
var CHAR_BACKWARD_SLASH = 92;
var CHAR_DOT = 46;
function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}
function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
}
function normalize(path) {
    if (path.length === 0)
        return '.';
    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
    // Normalize the path
    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute)
        path = '.';
    if (path.length > 0 && trailingSeparator)
        path += '/';
    if (isAbsolute)
        return '/' + path;
    return path;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    var res = '';
    var lastSegmentLength = 0;
    var lastSlash = -1;
    var dots = 0;
    var code;
    for (var i = 0; i <= path.length; ++i) {
        if (i < path.length)
            code = path.charCodeAt(i);
        else if (isPathSeparator(code))
            break;
        else
            code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            }
            else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 ||
                    res.charCodeAt(res.length - 1) !== CHAR_DOT ||
                    res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                    if (res.length > 2) {
                        var lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex !== res.length - 1) {
                            if (lastSlashIndex === -1) {
                                res = '';
                                lastSegmentLength = 0;
                            }
                            else {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    else if (res.length === 2 || res.length === 1) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0)
                        res += separator + "..";
                    else
                        res = '..';
                    lastSegmentLength = 2;
                }
            }
            else {
                if (res.length > 0)
                    res += separator + path.slice(lastSlash + 1, i);
                else
                    res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        }
        else if (code === CHAR_DOT && dots !== -1) {
            ++dots;
        }
        else {
            dots = -1;
        }
    }
    return res;
}
function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (arguments.length === 0)
        return '.';
    var sep = arguments[0].indexOf('/') > -1 ? '/' : '\\';
    var joined;
    var firstPart;
    for (var i = 0; i < arguments.length; ++i) {
        var arg = arguments[i];
        if (arg.length > 0) {
            if (joined === undefined)
                joined = firstPart = arg;
            else
                joined += sep + arg;
        }
    }
    if (joined === undefined)
        return '.';
    var needsReplace = true;
    var slashCount = 0;
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        var firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2)))
                        ++slashCount;
                    else {
                        // We matched a UNC path in the first part
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        // Find any more consecutive slashes we need to replace
        for (; slashCount < joined.length; ++slashCount) {
            if (!isPathSeparator(joined.charCodeAt(slashCount)))
                break;
        }
        // Replace the slashes if needed
        if (slashCount >= 2)
            joined = sep + joined.slice(slashCount);
    }
    return normalize(joined);
}
