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

// Decision-Making
const myAge = 15;
const isOldEnough = myAge >= 18;

if (isOldEnough) {
  console.log(`Orhun can start driving`);
} else {
  console.log(`Nope, not yet`);
}

let century;
const yourBirthYear = 1990;

if (yourBirthYear <= 2000) {
  century = 20;
} else {
  century = 21;
}

console.log(century);

// Type Conversion

const inputYear = '1990';
console.log(Number(inputYear) + 10);

console.log(Number('ORHUN')); // This gives NaN: Not a Number
console.log(String(35)); // This converts 35 to string

// Type Coercion

console.log('I am ' + 35 + ' years old');
console.log('35' - '10' - 10); // 15

let n = '1' + 1; // 11
n = n - 1; // 10
console.log(n);

// 5 falsy values: 0, '', undefined, null, NaN

console.log(Boolean(0));
console.log(Boolean(''));
console.log(Boolean(undefined));
console.log(Boolean(null));
console.log(Boolean(NaN));

console.log(Boolean('ORHUN'));
console.log(Boolean(35));

const money = 100;

if (money) {
  console.log('DO NOT SPEND');
} else {
  console.log('GET A JOB');
}

let height;

if (height) {
  console.log('IT IS DEFINED!');
} else {
  console.log('IT IS NOT DEFINED!');
}
