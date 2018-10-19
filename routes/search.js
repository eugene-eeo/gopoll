const router = require('express').Router();
const db = require('../db');
const schema = require('../schema');
const search = require('../search');


router.post('/', schema.validate({body: schema.search_schema}), (req, res) => {
    const q = req.body.q;
    const users = req.body.include_users
        ? search(Object.values(db.users), ['username', 'forename', 'surname'], q).map(x => x.to_json())
        : [];
    const polls = req.body.include_polls
        ? search(Object.values(db.polls), ['name', 'description'], q).map(x => x.to_json())
        : [];
    res.json({users, polls});
});


module.exports = router;
