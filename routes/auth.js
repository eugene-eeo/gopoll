const uuidv4 = require('uuid/v4');
const router = require('express').Router();
const { users, tokens } = require('../db');
const schema = require('../schema');
const {
    error,
    needs_auth,
    polls_created_by_user,
    polls_participated_by_user,
    get_user,
} = require('../utils');


router.post('/login', schema.validate({body: schema.login_schema}), (req, res) => {
    if (tokens[req.signedCookies.token]) {
        return error(res, 'already logged in');
    }

    const { username, password } = req.body;
    const user = users[username];

    if (!users.hasOwnProperty(username)) return error(res, "invalid username");
    if (user.password !== password)      return error(res, "invalid password");

    const token = uuidv4();
    tokens[token] = user;

    res.cookie('token', token, {signed: true});
    res.json(user.to_json());
});


router.get('/me', needs_auth, (req, res) => {
    const user = get_user(req);
    res.cookie('token', req.signedCookies.token, {signed: true});
    res.json({
        polls_created: polls_created_by_user(user),
        polls_participated: polls_participated_by_user(user),
        ...user.to_json(),
    });
});


router.post('/logout', needs_auth, (req, res) => {
    delete tokens[req.signedCookies.token];
    res.clearCookie('token');
    res.json({});
});


module.exports = router;
