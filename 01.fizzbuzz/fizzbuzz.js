#!/usr/bin/env node

function main() {
  for (let n = 1; n < 21; n++) {
    fizzbuzz(n);
  }
}

function fizzbuzz(number) {
  if (number % 3 == 0 && number % 5 == 0) {
    console.log("FizzBuzz");
  } else if (number % 3 == 0) {
    console.log("Fizz");
  } else if (number % 5 == 0) {
    console.log("Buzz");
  } else {
    console.log(`${number}`);
  }
}

main();
