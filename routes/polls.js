const router = require('express').Router();
const Poll = require('../models/poll');
const { polls } = require('../db');
const schema = require('../schema');
const { error_codes, error, needs_auth, get_user } = require('../utils');


router.post('/', needs_auth,
    schema.validate({body: schema.create_poll_schema}),
    (req, res) => {
        const user = get_user(req);
        const keys = Object.keys(polls);
        const id = (keys.length > 0)  // [].reduce => typeerror
            ? 1 + +keys.reduce((a, b) => Math.max(+a, +b))
            : 1;
        polls[id] = new Poll({
            id,
            user,
            name:        req.body.name,
            description: req.body.description,
            multi:       req.body.multi,
        });
        res.json(polls[id].to_json_with_details(user));
    });


router.get('/:id', (req, res) => {
    const user = get_user(req);
    const poll = polls[req.params.id];
    if (!poll) {
        return error(res, error_codes.POLL_NOT_FOUND, 404);
    }
    res.json(poll.to_json_with_details(user));
});


function check_poll_same_user(req, res, next) {
    const poll = polls[req.params.id];
    const user = get_user(req);
    if (!poll) {
        return error(res, error_codes.POLL_NOT_FOUND, 404);
    }
    if (user !== poll.user) {
        return error(res, error_codes.POLL_DIFFERENT_USER, 403);
    }
    next();
}


router.put('/:id',
    needs_auth,
    check_poll_same_user,
    schema.validate({body: schema.update_poll_schema}),
    (req, res) => {
        const poll = polls[req.params.id];
        const user = get_user(req);
        if (poll.finalized) {
            return error(res, error_codes.POLL_FINALIZED);
        }
        const max_id = poll.max_id();
        poll.name = req.body.name;
        poll.description = req.body.description;
        poll.options = poll.options.concat(req.body.options.map((opt, i) => {
            opt.id = max_id + (i + 1);
            opt.users = [];
            return opt;
        }));
        res.json(poll.to_json_with_details(user));
    });


router.delete('/:id',
    needs_auth,
    check_poll_same_user,
    (req, res) => {
        delete polls[req.params.id];
        res.json({});
    });


router.post('/:id/finalize',
    needs_auth,
    check_poll_same_user,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        poll.finalize();
        res.json(poll.to_json_with_details(user));
    });


router.post('/:id/vote/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        const option = poll.find_option(+req.params.opt);
        if (!option) {
            return error(res, error_codes.OPTION_NOT_FOUND, 404);
        }
        if (!poll.can_vote(user)) {
            return error(res, error_codes.CANNOT_VOTE, 401);
        }
        option.users.push(user);
        res.json(poll.to_json_with_details(user));
    });


router.delete('/:id/vote/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        if (poll.finalized) {
            return error(res, error_codes.POLL_FINALIZED);
        }
        const option = poll.find_option(+req.params.opt);
        if (!option) {
            return error(res, error_codes.OPTION_NOT_FOUND, 404);
        }
        const i = option.users.indexOf(user);
        if (i === -1) {
            return error(res, error_codes.HASNT_VOTED, 404);
        }
        option.users.splice(i, 1);
        res.json(poll.to_json_with_details(user));
    });


module.exports = router;
