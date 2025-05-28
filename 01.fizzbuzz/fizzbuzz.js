#!/usr/bin/env node

function fizzbuzz(number) {
  if (number % 3 === 0 && number % 5 === 0) {
    console.log("FizzBuzz");
  } else if (number % 3 === 0) {
    console.log("Fizz");
  } else if (number % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(String(number));
  }
}

function main() {
  for (let n = 1; n <= 20; n++) {
    fizzbuzz(n);
  }
}

main();
