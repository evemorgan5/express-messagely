"use strict";

const { authenticateJWT, ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get("/",
    ensureLoggedIn,
    async function (req, res, next) {
        const result = await User.all();

        return res.json({ users: result });
    });


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username",
    ensureCorrectUser,
    async function (req, res, next) {
        const username = req.params.username;
        const result = await User.get(username);

        return res.json({ user: result});
    }
);


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

module.exports = router;