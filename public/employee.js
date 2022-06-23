const Person = require("./person");


// extends繼承
class Employee extends Person {
    constructor(name = "", age = 20, employee_id = "") {
        super(name, age);   // 一定要在最前面用super呼叫父層的constructor
        this.employee_id = employee_id;
    }
    toJSON() {
        const { name, age, employee_id } = this;
        return { name, age, employee_id };
    }
    // toString  一樣直接繼承
}

module.exports = Employee;