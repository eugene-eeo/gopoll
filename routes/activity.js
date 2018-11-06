const router = require('express').Router();
const { users, activities } = require('../db');
const { needs_auth, error_codes, error, get_user } = require('../utils');


router.get('/', needs_auth, (req, res) => {
    const user = get_user(req);
    res.json(activities
        .filter(a => a.related_to(user))
        .map(a => a.to_json())
        .reverse());
});


router.get('/:username', (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        return error(res, error_codes.USER_NOT_FOUND);
    }
    res.json(activities
        .filter(a => a.user === user && a.viewable_by(null))
        .map(a => a.to_json())
        .reverse());
});


module.exports = router;
