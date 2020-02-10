"use strict";
/**
 * 此程序用于各种库和方法的测试，不算
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ora = require("ora");
let sp = ora("loading").start();
const delay = require("delay");
let now = 0;
async function change() {
    now++;
    sp.text = "hello" + now;
    sp.color = "yellow";
    await delay(500);
    change();
}
change();
