const Person = require(__dirname + "/person");

const p1 = new Person("Bill", 20);
const p2 = new Person("David");

console.log(p1);
console.log("" + p1);                       // 會有toString的效果，執行toString()
console.log(JSON.stringify(p2, null, 4));