#!/usr/bin/env node

import minimist from "minimist";

function getTargetMonth(argv) {
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
  return { year: Number(year), month: month - 1 };
}

function printCalender(year, month) {
  const firstDate = new Date(year, month);
  const dateStringArray = [];
  for (let n = 0; n < firstDate.getDay(); n++) {
    dateStringArray.push("  ");
  }
  const lastDate = new Date(year, month + 1, 0);
  for (let dayNumber = 1; dayNumber <= lastDate.getDate(); dayNumber++) {
    dateStringArray.push(String(dayNumber).padStart(2));
  }
  const weekRows = [];
  for (let index = 0; index < dateStringArray.length; index += 7) {
    weekRows.push(dateStringArray.slice(index, index + 7).join(" "));
  }
  console.log(`      ${month + 1}月 ${year}`);
  console.log("日 月 火 水 木 金 土");
  console.log(weekRows.join("\n"));
}

function main() {
  const { year, month } = getTargetMonth(process.argv);
  if (year === null || month === null) {
    process.exit(1);
    return;
  }
  printCalender(year, month);
}

main();
