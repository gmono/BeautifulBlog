"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runInThread_1 = require("./lib/runInThread");
let w = runInThread_1.runFunction((arg, arg2) => {
    console.log(arg, typeof arg2);
}, "a", { a: 2 });
w.stdout.on("data", (c) => console.log(c.toString()));
//# sourceMappingURL=testLib.js.map