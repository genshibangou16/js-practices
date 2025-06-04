#!/usr/bin/env node

import timers from "timers/promises";
import sqlite3 from "sqlite3";

const CREATE_BOOKS_TABLE =
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE);";
const INSERT_BOOK = "INSERT INTO books (title) VALUES ('吾輩は猫である');";
const SELECT_ALL_BOOKS = "SELECT id, title FROM books;";
const DROP_BOOKS_TABLE = "DROP TABLE books;";
const INSERT_BOOK_WITH_AUTHOR =
  "INSERT INTO books (title, author) VALUES ('吾輩は猫である', '夏目漱石');";
const SELECT_ALL_BOOKS_WITH_AUTHOR = "SELECT id, title, author FROM books;";

const db = new sqlite3.Database(":memory:");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function practice1() {
  db.run(CREATE_BOOKS_TABLE, [], function () {
    db.run(INSERT_BOOK, [], function () {
      console.log(this.lastID);
      db.get(SELECT_ALL_BOOKS, function (_, row) {
        console.log(row);
        db.run(DROP_BOOKS_TABLE);
      });
    });
  });

  await timers.setTimeout(100);

  db.run(CREATE_BOOKS_TABLE, (err) => {
    if (err) {
      console.error(err.message);
    }
    db.run(INSERT_BOOK_WITH_AUTHOR, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(this.lastID);
      }
      db.get(SELECT_ALL_BOOKS_WITH_AUTHOR, (err, row) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(row);
        }
        db.run(DROP_BOOKS_TABLE);
      });
    });
  });
}

async function practice2() {
  await run(CREATE_BOOKS_TABLE)
    .then(() => run(INSERT_BOOK))
    .then((res) => {
      console.log(res.lastID);
      return get(SELECT_ALL_BOOKS);
    })
    .then((res) => {
      console.log(res);
      return run(DROP_BOOKS_TABLE);
    });

  await timers.setTimeout(100);

  await run(CREATE_BOOKS_TABLE)
    .then(() => run(INSERT_BOOK_WITH_AUTHOR))
    .then((res) => {
      console.log(res.lastID);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .then(() => get(SELECT_ALL_BOOKS_WITH_AUTHOR))
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .finally(() => {
      return run(DROP_BOOKS_TABLE);
    });
}

async function practice3() {
  await run(CREATE_BOOKS_TABLE);
  const resInsert = await run(INSERT_BOOK);
  console.log(resInsert.lastID);
  const resSelect = await get(SELECT_ALL_BOOKS);
  console.log(resSelect);
  await run(DROP_BOOKS_TABLE);

  await timers.setTimeout(100);

  await run(CREATE_BOOKS_TABLE);
  try {
    const resInsertErr = await run(INSERT_BOOK_WITH_AUTHOR);
    console.log(resInsertErr.lastID);
  } catch (error) {
    console.error(error.message);
  }
  try {
    const resSelectErr = await get(SELECT_ALL_BOOKS_WITH_AUTHOR);
    console.log(resSelectErr);
  } catch (error) {
    if (error.code.startsWith("SQLITE")) {
      console.error(error.message);
    } else {
      throw error;
    }
  }
  await run(DROP_BOOKS_TABLE);
}

async function main() {
  console.log("== コールバック ==");
  await practice1();
  await timers.setTimeout(100);
  console.log("== チェーン ==");
  await practice2();
  await timers.setTimeout(100);
  console.log("== await ==");
  await practice3();
}

main();
