const Person = require(__dirname + "/person");
const Employee = require(__dirname + "/employee");

const p1 = new Person("Bill", 20);
const p2 = new Employee("David", 30, "D007");

console.log(p1);            // 直接印出來，會帶class name
console.log("" + p1);       // 轉換成字串，變成JSON格式
console.log(p2);
console.log("" + p2);