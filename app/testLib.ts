import { runFunction } from './sync';
let w=runFunction((arg,arg2)=>{
    console.log(arg,typeof arg2);
},"a",{a:2});
w.stdout.on("data",(c:Buffer)=>console.log(c.toString()));

