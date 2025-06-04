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

class DB {
  constructor(target) {
    this.db = new sqlite3.Database(target);
  }
  run(sql, ...args) {
    const { params, callback } = this.extractParamsAndCallback(args);
    this.db.run(sql, ...params, function (err) {
      callback(err, this);
    });
  }
  get(sql, ...args) {
    const { params, callback } = this.extractParamsAndCallback(args);
    this.db.get(sql, ...params, function (err, row) {
      callback(err, row);
    });
  }
  all(sql, ...args) {
    const { params, callback } = this.extractParamsAndCallback(args);
    this.db.all(sql, ...params, function (err, rows) {
      callback(err, rows);
    });
  }
  extractParamsAndCallback(args) {
    const maybeCallback = args[args.length - 1];
    const isCallback = typeof maybeCallback === "function";
    const callback = isCallback ? maybeCallback : () => {};
    const params = isCallback ? args.slice(0, -1) : args;
    return { callback, params };
  }
}

class AsyncDB extends DB {
  run(sql, ...params) {
    return new Promise((resolve, reject) => {
      super.run(sql, ...params, function (err, stmt) {
        if (err) {
          reject(err);
        } else {
          resolve(stmt);
        }
      });
    });
  }
  get(sql, ...params) {
    return new Promise((resolve, reject) => {
      super.get(sql, ...params, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  all(sql, ...params) {
    return new Promise((resolve, reject) => {
      super.all(sql, ...params, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

async function practice1() {
  const db = new DB(":memory:");
  db.run(CREATE_BOOKS_TABLE, () => {
    db.run(INSERT_BOOK, (_, res) => {
      console.log(res.lastID);
      db.get(SELECT_ALL_BOOKS, (_, res) => {
        console.log(res);
        db.run(DROP_BOOKS_TABLE);
      });
    });
  });

  await timers.setTimeout(100);

  db.run(CREATE_BOOKS_TABLE, (err) => {
    if (err) {
      console.error(err.message);
    }
    db.run(INSERT_BOOK_WITH_AUTHOR, (err, res) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(res.lastID);
      }
      db.get(SELECT_ALL_BOOKS_WITH_AUTHOR, (err, res) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(res);
        }
        db.run(DROP_BOOKS_TABLE);
      });
    });
  });
}

async function practice2() {
  const db = new AsyncDB(":memory:");
  await db
    .run(CREATE_BOOKS_TABLE)
    .then(() => db.run(INSERT_BOOK))
    .then((res) => {
      console.log(res.lastID);
      return db.get(SELECT_ALL_BOOKS);
    })
    .then((res) => {
      console.log(res);
      return db.run(DROP_BOOKS_TABLE);
    });

  await timers.setTimeout(100);

  await db
    .run(CREATE_BOOKS_TABLE)
    .then(() => db.run(INSERT_BOOK_WITH_AUTHOR))
    .then((res) => {
      console.log(res.lastID);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .then(() => db.get(SELECT_ALL_BOOKS_WITH_AUTHOR))
    .then((res) => {
      console.log(res);
      return db.run(DROP_BOOKS_TABLE);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

async function practice3() {
  const db = new AsyncDB(":memory:");
  await db.run(CREATE_BOOKS_TABLE);
  const resInsert = await db.run(INSERT_BOOK);
  console.log(resInsert.lastID);
  const resSelect = await db.get(SELECT_ALL_BOOKS);
  console.log(resSelect);
  await db.run(DROP_BOOKS_TABLE);

  await timers.setTimeout(100);

  await db.run(CREATE_BOOKS_TABLE);
  try {
    const resInsertErr = await db.run(INSERT_BOOK_WITH_AUTHOR);
    console.log(resInsertErr.lastID);
  } catch (error) {
    console.error(error.message);
  }
  try {
    const resSelectErr = await db.get(SELECT_ALL_BOOKS_WITH_AUTHOR);
    console.log(resSelectErr);
  } catch (error) {
    if (error.code.startsWith("SQLITE")) {
      console.error(error.message);
    } else {
      throw error;
    }
  }
  await db.run(DROP_BOOKS_TABLE);
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
