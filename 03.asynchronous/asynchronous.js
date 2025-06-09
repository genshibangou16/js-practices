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

function run(sql, db, params = []) {
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
function get(sql, db, params = []) {
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

async function fbcAsynchronousPracticeCallback(db) {
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

async function fbcAsynchronousPracticePromise(db) {
  await run(CREATE, db)
    .then(() => run(INSERT, db))
    .then((result) => {
      console.log(result.lastID);
      return get(SELECT, db);
    })
    .then((result) => {
      console.log(result);
      return run(DROP, db);
    });

  await timers.setTimeout(100);

  await run(CREATE, db)
    .then(() => run(INSERT_BOOK_WITH_AUTHOR, db))
    .then((result) => {
      console.log(result.lastID);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .then(() => get(SELECT_ALL_BOOKS_WITH_AUTHOR, db))
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .finally(() => run(DROP, db));
}

async function fbcAsynchronousPracticeAsyncAwait(db) {
  await run(CREATE, db);
  const resultInsert = await run(INSERT, db);
  console.log(resultInsert.lastID);
  const resultSelect = await get(SELECT, db);
  console.log(resultSelect);
  await run(DROP, db);

  await timers.setTimeout(100);

  await run(CREATE, db);
  try {
    const resultInsertErr = await run(INSERT_BOOK_WITH_AUTHOR, db);
    console.log(resultInsertErr.lastID);
  } catch (error) {
    console.error(error.message);
  }
  try {
    const resultSelectErr = await get(SELECT_ALL_BOOKS_WITH_AUTHOR, db);
    console.log(resultSelectErr);
  } catch (error) {
    if (error.code.startsWith("SQLITE")) {
      console.error(error.message);
    } else {
      throw error;
    }
  }
  await run(DROP, db);
}

async function main() {
  const db = new sqlite3.Database(":memory:");
  console.log("== コールバック ==");
  await fbcAsynchronousPracticeCallback(db);
  await timers.setTimeout(100);
  console.log("== Promise ==");
  await fbcAsynchronousPracticePromise(db);
  await timers.setTimeout(100);
  console.log("== async/await ==");
  await fbcAsynchronousPracticeAsyncAwait(db);
}

main();
