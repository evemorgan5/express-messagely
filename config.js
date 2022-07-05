"use strict";

/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

// const DB_URI = (process.env.NODE_ENV === "test")
//     ? "postgresql:///messagely_test"
//     : "postgresql:///messagely";

// HAM'S DB_URI
const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql://hannahanela:foofoo@localhost/messagely_test"
    : "postgresql://hannahanela:foofoo@localhost/messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};