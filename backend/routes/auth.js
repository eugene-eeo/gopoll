const router = require('express').Router();
const users = require('../db').users;
const schema = require('../schema');
const {
    error,
    needs_auth,
    polls_created_by_user,
    polls_participated_by_user,
    get_user,
} = require('../utils');


router.post('/login', schema.validate({body: schema.login_schema}), (req, res) => {
    if (req.signedCookies.login) {
        return error(res, 'already logged in');
    }

    const { username, password } = req.body;
    const user = users[username];

    if (!users.hasOwnProperty(username)) return error(res, "invalid username");
    if (user.password !== password)      return error(res, "invalid password");

    res.cookie('login', username, {signed: true});
    res.json(user.to_json());
});


router.get('/me', needs_auth, (req, res) => {
    const user = get_user(req);
    res.cookie('login', user.username, {signed: true});
    res.json({
        polls_created: polls_created_by_user(user),
        polls_participated: polls_participated_by_user(user),
        ...user.to_json(),
    });
});

router.post('/logout', needs_auth, (req, res) => {
    res.clearCookie('login');
    res.json({});
});


module.exports = router;
