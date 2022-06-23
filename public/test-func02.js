import t, { f, f3, b } from "./func02.js";
import t2, * as t3 from "./func02.js";      // *等於其他的{ f, f3, b }，存成t3

console.log(t);
console.log(f(7));
console.log(f3(4));
console.log(b);
// --------------

console.log(t3.f3(4));
console.log(t3.b);