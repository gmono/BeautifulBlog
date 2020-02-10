/**
 * 此程序用于各种库和方法的测试，不算
 */

import * as ora from "ora"
let sp=ora("loading").start();
import * as delay from "delay"
let now=0;
async function change()
{
    now++;
    sp.text="hello"+now;
    sp.color="yellow";
    await delay(500);
    change();
}
change();