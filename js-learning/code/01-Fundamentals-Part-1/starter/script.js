let js = 'Consistency is key!';
console.log(40 + 10);

let firstName = 'ORHUN';
console.log(firstName);

// ----- Primitive Data Types -----

let xage = 35;
let myName = 'ORHUN';
let isGoodAtJavascript = false;
let thisIsUndefined;
// null
// symbol -> ES2015
// BigInt -> ES2020

console.log(typeof xage);
console.log(typeof myName);
console.log(typeof isGoodAtJavascript);

console.log(isGoodAtJavascript);
isGoodAtJavascript = 'YES';
console.log(isGoodAtJavascript);

console.log(thisIsUndefined);
console.log(typeof thisIsUndefined);

thisIsUndefined = 'Not anymore';
console.log(thisIsUndefined);
console.log(typeof thisIsUndefined);

console.log(typeof null);

// ----- let, const, var -----

let age = 35;
const birthYear = 1990;
// const job; -> this is not allowed

var job = 'programmer';
job = 'teacher';
console.log(job);

// Math Operators
const now = 2050;
const ageOrhun = now - 1990;
const ageRabia = now - 1992;
console.log(ageOrhun, ageRabia);
console.log(ageOrhun * 2, ageRabia / 2);

const myFirstName = 'ORHUN';
const myLastName = 'AKKAN';
console.log(myFirstName + ' ' + myLastName);

// Assignment Operators
let x = 15;
x += 10;
x *= 5;
x++;
x--;
console.log(x);

// Comparison Operators
console.log(ageOrhun > ageRabia); // >, <, >=, <=

// Operator Precedence is followed in calculations.

// Template Literals
const orhun = `My name is ${myFirstName} and my last name is ${myLastName}`;
console.log(orhun);
