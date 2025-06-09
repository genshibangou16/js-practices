#!/usr/bin/env node

import timers from "timers/promises";
import sqlite3 from "sqlite3";

const SQL_STATEMENT_CREATE =
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE);";
const SQL_STATEMENT_INSERT =
  "INSERT INTO books (title) VALUES ('吾輩は猫である');";
const SQL_STATEMENT_SELECT = "SELECT id, title FROM books;";
const SQL_STATEMENT_DROP = "DROP TABLE books;";
const SQL_STATEMENT_INSERT_WITH_ERROR =
  "INSERT INTO books (title, author) VALUES ('吾輩は猫である', '夏目漱石');";
const SQL_STATEMENT_SELECT_WITH_ERROR = "SELECT id, title, author FROM books;";

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

async function fbcAsynchronousPracticeCallback() {
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

async function fbcAsynchronousPracticePromise() {
  await run(CREATE_BOOKS_TABLE)
    .then(() => run(INSERT_BOOK))
    .then((result) => {
      console.log(result.lastID);
      return get(SELECT_ALL_BOOKS);
    })
    .then((result) => {
      console.log(result);
      return run(DROP_BOOKS_TABLE);
    });

  await timers.setTimeout(100);

  await run(CREATE_BOOKS_TABLE)
    .then(() => run(INSERT_BOOK_WITH_AUTHOR))
    .then((result) => {
      console.log(result.lastID);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .then(() => get(SELECT_ALL_BOOKS_WITH_AUTHOR))
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .finally(() => run(DROP_BOOKS_TABLE));
}

async function fbcAsynchronousPracticeAsyncAwait() {
  await run(CREATE_BOOKS_TABLE);
  const resultInsert = await run(INSERT_BOOK);
  console.log(resultInsert.lastID);
  const resultSelect = await get(SELECT_ALL_BOOKS);
  console.log(resultSelect);
  await run(DROP_BOOKS_TABLE);

  await timers.setTimeout(100);

  await run(CREATE_BOOKS_TABLE);
  try {
    const resultInsertErr = await run(INSERT_BOOK_WITH_AUTHOR);
    console.log(resultInsertErr.lastID);
  } catch (error) {
    console.error(error.message);
  }
  try {
    const resultSelectErr = await get(SELECT_ALL_BOOKS_WITH_AUTHOR);
    console.log(resultSelectErr);
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
  await fbcAsynchronousPracticeCallback();
  await timers.setTimeout(100);
  console.log("== Promise ==");
  await fbcAsynchronousPracticePromise();
  await timers.setTimeout(100);
  console.log("== async/await ==");
  await fbcAsynchronousPracticeAsyncAwait();
}

main();
