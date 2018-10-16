const router = require('express').Router();
const Poll = require('../models/poll');
const polls = require('../db').polls;
const schema = require('../schema');
const { error, needs_auth, get_user } = require('../utils');


router.post('/', needs_auth,
    schema.validate({body: schema.create_poll_schema}),
    (req, res) => {
        const user = get_user(req);
        // workaround because [].reduce => typeerror
        const keys = Object.keys(polls);
        const id = keys.length > 0
            ? 1 + keys.reduce((a, b) => Math.max(a, b))
            : 1;
        polls[id] = new Poll({
            id,
            user,
            name:        req.body.name,
            description: req.body.description,
            multi:       req.body.multi,
        });
        res.json(polls[id].to_json_with_votes());
    });


router.get('/:id', (req, res) => {
    const poll = polls[req.params.id];
    if (poll === undefined) {
        res.status(404);
        res.end();
        return;
    }
    res.json(poll.to_json_with_votes());
});


function check_poll_same_user(req, res, next) {
    const poll = polls[req.params.id];
    const user = get_user(req);
    if (poll === undefined) {
        res.status(404);
        res.end();
        return;
    }
    if (user !== poll.user) {
        res.status(403);
        res.end();
        return;
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
            const op2 = poll.options.find(x => x.id == opt.id);
            opt.users = op2
                ? op2.users
                : [];
            return opt;
        });
        res.json(poll.to_json_with_votes());
    });


router.delete('/:id',
    needs_auth,
    check_poll_same_user,
    (req, res) => {
        delete polls[req.params.id];
        res.json({});
    });


router.post('/:id/option/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
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


router.delete('/:id/option/:opt',
    needs_auth,
    (req, res) => {
        const user = get_user(req);
        const poll = polls[req.params.id];
        const option = poll.find_option(+req.params.opt);
        if (!option) {
            res.status(404);
            res.end();
            return;
        }
        const i = option.users.indexOf(user);
        if (i !== -1) {
            option.users.splice(i, 1);
        }
        res.json({});
    });


module.exports = router;
