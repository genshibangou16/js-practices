#!/usr/bin/env node

import timers from "timers/promises";
import sqlite3 from "sqlite3";

const CREATE =
  "create table books (id integer primary key autoincrement, title text not null unique);";
const INSERT = "INSERT INTO books (title) VALUES ('吾輩は猫である');";
const SELECT = "SELECT id, title FROM books;";
const DELETE = "DROP TABLE books;";
const INSERT_ERROR =
  "INSERT INTO books (title, author) VALUES ('吾輩は猫である', '夏目漱石');";
const SELECT_ERROR = "SELECT id, title, author FROM books;";

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
  db.run(CREATE, (err) => {
    if (err) return;
    db.run(INSERT, (err, res) => {
      if (err) return;
      console.log(res.lastID);
      db.get(SELECT, (err, res) => {
        if (err) return;
        console.log(res);
        db.run(DELETE);
      });
    });
  });
  await timers.setTimeout(100);
  db.run(CREATE, (err) => {
    if (err) {
      console.log(err.message);
    }
    db.run(INSERT_ERROR, (err, res) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(res.lastID);
      }
      db.get(SELECT_ERROR, (err, res) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(res);
        }
        db.run(DELETE);
      });
    });
  });
}

async function practice2() {
  const db = new AsyncDB(":memory:");
  db.run(CREATE)
    .then(() => {
      return db.run(INSERT);
    })
    .then((res) => {
      console.log(res.lastID);
    })
    .then(() => {
      return db.get(SELECT);
    })
    .then((res) => {
      console.log(res);
    })
    .then(() => {
      db.run(DELETE);
    });
  await timers.setTimeout(100);
  db.run(CREATE)
    .then(() => {
      return db.run(INSERT_ERROR);
    })
    .then((res) => {
      console.log(res.lastID);
    })
    .catch((error) => {
      console.error(error.message);
    })
    .then(() => {
      return db.get(SELECT_ERROR);
    })
    .then((res) => {
      console.log(res);
    })
    .then(() => {
      db.run(DELETE);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

async function practice3() {
  const db = new AsyncDB(":memory:");
  await db.run(CREATE);
  const res_insert = await db.run(INSERT);
  console.log(res_insert.lastID);
  const res_select = await db.get(SELECT);
  console.log(res_select);
  await db.run(DELETE);
  await timers.setTimeout(100);
  await db.run(CREATE);
  try {
    const res_insert_err = await db.run(INSERT_ERROR);
    console.log(res_insert_err.lastID);
  } catch (error) {
    console.error(error.message);
  }
  try {
    const res_select_err = await db.get(SELECT_ERROR);
    console.log(res_select_err);
  } catch (error) {
    console.error(error.message);
  }
  await db.run(DELETE);
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
