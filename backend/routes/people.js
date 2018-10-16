const router = require('express').Router();
const User = require('../models/user');
const users = require('../db').users;
const schema = require('../schema');
const { error } = require('../utils');


router.get('/', (req, res) => {
    res.json(Object.values(users).map(x => x.to_json()));
});


router.post('/', schema.validate({body: schema.create_user_schema}), (req, res) => {
    // Check if username is taken
    if (users.hasOwnProperty(req.body.username)) {
        return error(res, "username is taken");
    }
    const user = new User({
        username: req.body.username,
        forename: req.body.forename,
        surname:  req.body.surname,
        password: req.body.password,
    });
    users[user.username] = user;
    res.json(user.to_json());
});


router.get('/:username', (req, res) => {
    const username = req.params.username;
    if (!users.hasOwnProperty(username)) {
        res.status(400).end();
        return;
    }
    res.json(users[username].to_json());
});


module.exports = router;
