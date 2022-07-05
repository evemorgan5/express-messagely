"use strict";

const { SECRET_KEY } = require("../config");
const db = require("../db");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function(req, res, next) {
  const {username, password} = req.body;
  const result = await User.authenticate(username, password);
  if (result === true) {
    // generate token
    const token = jwt.sign({username}, SECRET_KEY);
    return res.json({token});
  } else {
    throw new UnauthorizedError("Invalid user/password");
  }
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function(req, res, next) {
  const {username, password, first_name, last_name, phone} = req.body;
  // register user and save data to db
  const regResult = await User.register(username, password, first_name, last_name, phone);
  const logResult = await User.authenticate(username, password);
  if (logResult === true) {
    // generate token
    const token = jwt.sign({username}, SECRET_KEY);
    return res.json({token});
  } else {
    throw new UnauthorizedError("Invalid user/password");
  }
});


module.exports = router;