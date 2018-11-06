const router = require('express').Router();
const Poll = require('../models/poll');
const Activity = require('../models/activity');
const { polls, activities } = require('../db');
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
        activities.push(Activity.from_poll(polls[id]));
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
        const user = get_user(req);
        const poll = polls[req.params.id];
        poll.finalize();
        activities.push(Activity.from_finalize(poll));
        res.json(poll.to_json_with_details(user));
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
            return error(res, error_codes.OPTION_NOT_FOUND, 404);
        }
        // non multi poll and we can find another voted option
        if (!poll.can_vote(user)) {
            return error(res, error_codes.CANNOT_VOTE, 401);
        }
        option.users.push(user);
        activities.push(Activity.from_vote(user, poll, option));
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
        activities.push(Activity.from_unvote(user, poll, option));
        res.json(poll.to_json_with_details(user));
    });


module.exports = router;
