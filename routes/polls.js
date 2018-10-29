const router = require('express').Router();
const Poll = require('../models/poll');
const polls = require('../db').polls;
const schema = require('../schema');
const { error_json, error_codes, error, needs_auth, get_user } = require('../utils');


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
        return res
            .status(404)
            .json(error_json(error_codes.POLL_NOT_FOUND));
    }
    res.json(poll.to_json_with_details(user));
});


function check_poll_same_user(req, res, next) {
    const poll = polls[req.params.id];
    const user = get_user(req);
    if (!poll) {
        return res.status(404).json(error_json(error_codes.POLL_NOT_FOUND));
    }
    if (user !== poll.user) {
        return res.status(403).json(error_json(error_codes.POLL_DIFFERENT_USER));
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
        poll.name = req.body.name;
        poll.description = req.body.description;
        poll.options = req.body.options.map(opt => {
            const op2 = poll.find_option(opt.id);
            opt.users = op2 ? op2.users : [];
            return opt;
        });
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
        polls[req.params.id].finalize();
        res.json({});
    });


router.post('/:id/vote/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        if (poll.finalized) {
            error(res, error_codes.POLL_FINALIZED);
            return;
        }
        const option = poll.find_option(+req.params.opt);
        if (!option) {
            res.status(404);
            res.end();
            return;
        }
        // non multi poll and we can find another voted option
        if (!poll.can_vote(user)) {
            res.status(401);
            res.end();
            return;
        }
        option.users.push(user);
        res.json({});
    });


router.delete('/:id/vote/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        if (poll.finalized) {
            error(res, error_codes.POLL_FINALIZED);
            return;
        }
        const option = poll.find_option(+req.params.opt);
        if (!option) {
            res.status(404);
            res.end();
            return;
        }
        const i = option.users.indexOf(user);
        if (i === -1) {
            res.status(404);
            res.end();
            return;
        }
        option.users.splice(i, 1);
        res.json({});
    });


module.exports = router;
