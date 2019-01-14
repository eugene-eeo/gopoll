const uuidv4 = require('uuid/v4');
const router = require('express').Router();
const { users, tokens } = require('../db');
const schema = require('../schema');
const {
    error,
    error_codes,
    needs_auth,
    polls_created_by_user,
    polls_participated_by_user,
    get_user,
} = require('../utils');


router.post('/login', schema.validate({body: schema.login_schema}), (req, res) => {
    if (tokens[req.signedCookies.token]) {
        return error(res, error_codes.ALREADY_LOGGED_IN);
    }

    const { username, password } = req.body;
    const user = users[username];

    if (!users.hasOwnProperty(username)) return error(res, error_codes.INVALID_USERNAME);
    if (user.password !== password)      return error(res, error_codes.INVALID_PASSWORD);

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


router.post('/settings',
    needs_auth,
    schema.validate({body: schema.change_user_settings_schema}),
    (req, res) => {
        const user = get_user(req);
        if (users[req.body.username] && users[req.body.username] !== user) {
            return error(res, error_codes.USERNAME_TAKEN);
        }
        delete users[user.username];
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;
        if (req.body.forename) user.forename = req.body.forename;
        if (req.body.surname)  user.surname  = req.body.surname;
        users[user.username] = user;
        res.json(user.to_json());
    });


router.post('/logout', needs_auth, (req, res) => {
    delete tokens[req.signedCookies.token];
    res.clearCookie('token');
    res.json({});
});


module.exports = router;
