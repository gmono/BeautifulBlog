var React;
var ReactDOM;
var ele = React.createElement("div", null, "hello world");
var ABC = function () { return React.createElement("div", null); };
React.createElement(ABC, null);
ReactDOM.render(ele, document.querySelector("div"));
