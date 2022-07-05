"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

const bcrypt = require("bcrypt");

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at)
        VALUES
          ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
          RETURNING username,
          password,
          first_name,
          last_name,
          phone`,
      [username, hashedPassword, first_name, last_name, phone]);
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`, [username]);
      const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
        `UPDATE users
        SET last_login_at = current_timestamp
          WHERE username = $1
          RETURNING username`,
      [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name FROM users`);

    let users = result.rows;
    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT
        username,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at
      FROM
        users
      WHERE username = $1`,
      [username]);

    let user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT
        m.id,
        m.to_username,
        m.body,
        m.sent_at,
        m.read_at,
        u.first_name,
        u.last_name,
        u.phone
      FROM
        messages AS m
      JOIN users AS u
      ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]);

    let messages = result.rows;
    console.log(messages.to_username);


    // let {id, messages.to_username = {username, first_name, last_name, phone}, body, send_at, read_at} = messagesResults
    let { id, body, sent_at, read_at, ...to_user } = messages;
    console.log("messagesResults=", messages);
    console.log("to_user",to_user);
    return messages;

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */
  static async messagesTo(username) {
    const mResults = await db.query(
      `SELECT id, from_username AS from_user, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username]);
    let message = mResults.rows;

    const fromUserResults = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
          JOIN messages ON users.username = messages.from_username
      WHERE messages.to_username = $1`,
      [username]);
    let from_user = fromUserResults.rows[0];

    message[0].from_user = from_user;

    return message;
  }
}


module.exports = User;
