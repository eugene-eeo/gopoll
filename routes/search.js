const router = require('express').Router();
const db = require('../db');
const schema = require('../schema');
const search = require('../search');


const USER_ATTRS = ['username', 'forename', 'surname'];
const POLL_ATTRS = ['name', 'description'];
const COMMENT_ATTRS = ['text', 'poll.name', 'user.username'];


router.post('/', schema.validate({body: schema.search_schema}), (req, res) => {
    const q = req.body.q;
    const users = req.body.include_users ? search(Object.values(db.users), USER_ATTRS, q) : [];
    const polls = req.body.include_polls ? search(Object.values(db.polls), POLL_ATTRS, q) : [];
    const comments = req.body.include_comments ? search(Object.values(db.comments), COMMENT_ATTRS, q) : [];
    res.json({
        users: users.map(x => x.to_json()),
        polls: polls.map(x => x.to_json()),
        comments: comments.map(x => x.to_json_with_context()),
    });
});


module.exports = router;
