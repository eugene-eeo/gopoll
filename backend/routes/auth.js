const router = require('express').Router();
const users = require('../db').users;
const schema = require('../schema');
const { error, needs_auth } = require('../utils');


router.post('/login', schema.validate({body: schema.login_schema}), (req, res) => {
    if (req.signedCookies.login) {
        return error(res, 'already logged in');
    }

    const { username, password } = req.body;
    const user = users[username];

    if (!users.hasOwnProperty(username)) return error(res, "invalid username");
    if (user.password !== password)      return error(res, "invalid password");

    // TODO: return polls that user has been part of
    res.cookie('login', username, {signed: true});
    res.json(user.toJSON());
});


router.get('/me', needs_auth, (req, res) => {
    // TODO: return polls that user has been part of
    const user = users[req.signedCookies.login];
    res.json(user.toJSON());
});

router.post('/logout', needs_auth, (req, res) => {
    res.clearCookie('login');
    res.json({});
});


module.exports = router;
