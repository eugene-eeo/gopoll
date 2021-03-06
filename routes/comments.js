const uuidv4 = require('uuid/v4');
const router = require('express').Router();

const Comment = require('../models/comment');
const schema = require('../schema');
const { polls, comments } = require('../db');
const { error_codes, error, needs_auth, get_user } = require('../utils');


router.post('/',
    needs_auth,
    schema.validate({body: schema.create_comment_schema}),
    (req, res) => {
        // find what the comment is replying to.
        // both comment and poll share similar structure so this is ok.
        let reply_to = null;
        if (req.body.reply_to !== undefined) reply_to = comments[req.body.reply_to];
        if (req.body.poll_id  !== undefined) reply_to = polls[req.body.poll_id];
        if (!reply_to) {
            error(res, error_codes.NEEDS_REPLY);
            return;
        }
        const uuid = uuidv4();
        const comment = new Comment({
            id: uuid,
            text: req.body.text,
            user: get_user(req),
            poll: reply_to.poll || reply_to,
            parent: reply_to,
        });
        reply_to.comments.push(comment);
        comments[uuid] = comment;
        res.json(comment.to_json());
    });


function check_comment_same_user(req, res, next) {
    const comment = comments[req.params.id];
    if (!comment) {
        error(res, error_codes.COMMENT_NOT_FOUND, 404);
        return;
    }
    if (comment.user !== get_user(req)) {
        error(res, error_codes.COMMENT_DIFFERENT_USER);
        return;
    }
    next();
}


router.put('/:id',
    needs_auth,
    check_comment_same_user,
    schema.validate({body: schema.update_comment_schema}),
    (req, res) => {
        const comment = comments[req.params.id];
        comment.text = req.body.text;
        res.json(comment.to_json());
    });


router.delete('/:id',
    needs_auth,
    check_comment_same_user,
    (req, res) => {
        const comment = comments[req.params.id];
        comment.remove();
        res.json({});
    });


module.exports = router;
