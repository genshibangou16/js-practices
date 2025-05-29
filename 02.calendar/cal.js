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

function getLastDate(targetDate) {
  targetDate.setMonth(targetDate.getMonth() + 1);
  targetDate.setDate(0);
  return targetDate;
}

function generate(targetDate) {
  const dateArray = [];
  for (let n = 0; n < targetDate.getDay(); n++) {
    dateArray.push("  ");
  }
  const lastDate = getLastDate(targetDate);
  for (let date = 1; date <= lastDate.getDate(); date++) {
    dateArray.push(String(date).padStart(2));
  }
  const monthString = [];
  for (let index = 0; index < dateArray.length; index += 7) {
    monthString.push(dateArray.slice(index, index + 7).join(" "));
  }
  return monthString.join("\n");
}

function main() {
  const { year = null, month = null } = parseInput(process.argv);
  if (year === null || month === null) return;
  const targetDate = new Date(year, month);
  console.log(`      ${month + 1}月 ${year}`);
  console.log("日 月 火 水 木 金 土");
  console.log(generate(targetDate));
}

main();
