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
  run(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
  get(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, ...params, function (err, rows) {
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
      this.db.all(sql, ...params, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

async function practice2() {
  const db = new DB(":memory:");
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
  const db = new DB(":memory:");
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

function main() {
  practice2();
  practice3();
}

main();
