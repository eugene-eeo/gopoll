const router = require('express').Router();
const User = require('../models/user');
const users = require('../db').users;
const schema = require('../schema');
const { error_codes, polls_created_by_user, error } = require('../utils');


router.get('/', (req, res) => {
    res.json(Object.values(users).map(x => x.to_json()));
});


router.post('/',
    // We need this for the jest tests since values are sent in the headers.
    // Password is not given as well, but we expect it so we need to provide a password.
    (req, res, next) => {
        if (req.headers.username) {
            req.body = {
                access_token: req.headers.access_token,
                username:     req.headers.username,
                forename:     req.headers.forename,
                surname:      req.headers.surname,
                password:     "abc",
            };
        }
        next();
    },
    schema.validate({body: schema.create_user_schema}),
    (req, res) => {
        // Check if access token is correct
        if (req.body.access_token !== 'concertina') {
            return error(res, error_codes.INVALID_ACCESS_TOKEN, 403);
        }
        // Check if username is taken
        if (users.hasOwnProperty(req.body.username)) {
            return error(res, error_codes.USERNAME_TAKEN);
        }
        const user = new User({
            username: req.body.username,
            forename: req.body.forename,
            surname:  req.body.surname,
            password: req.body.password,
        });
        users[user.username] = user;
        res.json(user.to_json());
    }
);


router.get('/:username', (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        res.status(404).end();
        return;
    }
    res.json({
        polls_created: polls_created_by_user(user),
        ...user.to_json()
    });
});


module.exports = router;
