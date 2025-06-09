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
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function fbcAsynchronousPracticeCallback(db) {
  db.run(SQL_STATEMENT_CREATE, () => {
    db.run(SQL_STATEMENT_INSERT, function () {
      console.log(this.lastID);
      db.get(SQL_STATEMENT_SELECT, (_, row) => {
        console.log(row);
        db.run(SQL_STATEMENT_DROP);
      });
    });
  });

  await timers.setTimeout(100);

  db.run(SQL_STATEMENT_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    db.run(SQL_STATEMENT_INSERT_WITH_ERROR, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(this.lastID);
      }
      db.get(SQL_STATEMENT_SELECT_WITH_ERROR, (err, row) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(row);
        }
        db.run(SQL_STATEMENT_DROP);
      });
    });
  });
}

async function fbcAsynchronousPracticePromise(db) {
  await run(SQL_STATEMENT_CREATE, db)
    .then(() => run(SQL_STATEMENT_INSERT, db))
    .then((result) => {
      console.log(result.lastID);
      return get(SQL_STATEMENT_SELECT, db);
    })
    .then((result) => {
      console.log(result);
      return run(SQL_STATEMENT_DROP, db);
    });

  await timers.setTimeout(100);

  await run(SQL_STATEMENT_CREATE, db)
    .then(() => run(SQL_STATEMENT_INSERT_WITH_ERROR, db))
    .then((result) => {
      console.log(result.lastID);
    })
    .catch((error) => {
      if (error.code && error.code.startsWith("SQLITE")) {
      console.error(error.message);
      } else {
        throw error;
      }
    })
    .then(() => get(SQL_STATEMENT_SELECT_WITH_ERROR, db))
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      if (error.code && error.code.startsWith("SQLITE")) {
      console.error(error.message);
      } else {
        throw error;
      }
    })
    .finally(() => run(SQL_STATEMENT_DROP, db));
}

async function fbcAsynchronousPracticeAsyncAwait(db) {
  await run(SQL_STATEMENT_CREATE, db);
  const resultInsert = await run(SQL_STATEMENT_INSERT, db);
  console.log(resultInsert.lastID);
  const resultSelect = await get(SQL_STATEMENT_SELECT, db);
  console.log(resultSelect);
  await run(SQL_STATEMENT_DROP, db);

  await timers.setTimeout(100);

  await run(SQL_STATEMENT_CREATE, db);
  try {
    const resultInsertErr = await run(SQL_STATEMENT_INSERT_WITH_ERROR, db);
    console.log(resultInsertErr.lastID);
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE")) {
    console.error(error.message);
    } else {
      throw error;
    }
  }
  try {
    const resultSelectErr = await get(SQL_STATEMENT_SELECT_WITH_ERROR, db);
    console.log(resultSelectErr);
  } catch (error) {
    if (error.code && error.code.startsWith("SQLITE")) {
      console.error(error.message);
    } else {
      throw error;
    }
  }
  await run(SQL_STATEMENT_DROP, db);
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
