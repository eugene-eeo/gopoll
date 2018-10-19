const uuidv4 = require('uuid/v4');
const router = require('express').Router();

const Comment = require('../models/comment');
const schema = require('../schema');
const { polls, comments } = require('../db');
const { error, needs_auth, get_user } = require('../utils');


router.post('/',
    needs_auth,
    schema.validate({body: schema.create_comment_schema}),
    (req, res) => {
        const uuid = uuidv4();
        const comment = new Comment({
            id: uuid,
            text: req.body.text,
            user: get_user(req),
        });
        // find what the comment is replying to
        // since both comment and poll share similar structure
        // this is ok.
        let reply_to = (req.body.poll_id !== undefined)
            ? polls[req.body.poll_id]
            : (req.body.reply_to !== undefined)
                ? comments[req.body.reply_to]
                : null;
        if (reply_to == null) {
            error(res, "need reply_to or poll_id");
            return;
        }
        if (!reply_to) {
            res.status(404).end();
            return;
        }
        reply_to.comments.push(comment);
        comment.parent = reply_to;
        comments[uuid] = comment;
        res.json(comment.to_json());
    });


router.put('/:id',
    needs_auth,
    schema.validate({body: schema.update_comment_schema}),
    (req, res) => {
        const comment = comments[req.params.id];
        if (!comment) {
            res.status(404).end();
            return;
        }
        comment.text = req.body.text;
        res.json(comment.to_json());
    });


router.delete('/:id',
    needs_auth,
    (req, res) => {
        const comment = comments[req.params.id];
        if (!comment) {
            res.status(404).end();
            return;
        }
        const i = comment.parent.comments.indexOf(comment);
        comment.parent.comments.splice(i, 1);
        delete comments[req.params.id];
        res.json({});
    });


module.exports = router;