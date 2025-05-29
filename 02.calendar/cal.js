#!/usr/bin/env node

import minimist from "minimist";

function parseInput(argv) {
  const date = new Date();
  const { m: month = date.getMonth() + 1, y: year = date.getFullYear() } =
    minimist(argv.slice(2));
  if (isNaN(year) || year < 1 || year > 9999) {
    console.log(`cal: year '${year}' not in range 1..9999`);
    return { year: null, month: null };
  }
  if (isNaN(month) || month < 1 || month > 12) {
    console.log(`cal: ${month} is neither a month number (1..12) nor a name`);
    return { year: null, month: null };
  }
  return { year: year, month: month - 1 };
}

function generate(firstDate) {
  const dateArray = [];
  for (let n = 0; n < firstDate.getDay(); n++) {
    dateArray.push("  ");
  }
  const lastDate = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth() + 1,
    0,
  );
  for (let dayNumber = 1; dayNumber <= lastDate.getDate(); dayNumber++) {
    dateArray.push(String(dayNumber).padStart(2));
  }
  const monthStringArray = [];
  for (let index = 0; index < dateArray.length; index += 7) {
    monthStringArray.push(dateArray.slice(index, index + 7).join(" "));
  }
  return monthStringArray.join("\n");
}

function main() {
  const { year, month } = parseInput(process.argv);
  if (year === null || month === null) process.exit(1);
  const firstDate = new Date(year, month);
  console.log(`      ${month + 1}月 ${year}`);
  console.log("日 月 火 水 木 金 土");
  console.log(generate(firstDate));
}

main();
