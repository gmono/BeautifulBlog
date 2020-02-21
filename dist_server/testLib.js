"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = require("./sync");
let w = sync_1.runFunction((arg, arg2) => {
    console.log(arg, typeof arg2);
}, "a", { a: 2 });
w.stdout.on("data", (c) => console.log(c.toString()));
//# sourceMappingURL=testLib.js.map