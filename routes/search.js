const router = require('express').Router();
const db = require('../db');
const schema = require('../schema');
const search = require('../search');


const USER_ATTRS = ['username', 'forename', 'surname'];
const POLL_ATTRS = ['name', 'description'];
const COMMENT_ATTRS = ['text', 'poll.name', 'user.username'];


router.get('/', (req, res) => {
    const q = req.query.q;
    const users = search(Object.values(db.users), USER_ATTRS, q);
    const polls = search(Object.values(db.polls), POLL_ATTRS, q);
    const comments = search(Object.values(db.comments), COMMENT_ATTRS, q);
    res.json({
        users: users.map(x => x.to_json()),
        polls: polls.map(x => x.to_json()),
        comments: comments.map(x => x.to_json_with_context()),
    });
});


module.exports = router;
