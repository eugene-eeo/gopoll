const { comments } = require('../db');

function Comment({id, text, user, poll}) {
    this.id = id;
    this.text = text;
    this.user = user;
    this.comments = [];
    this.parent = null;
    this.poll = poll;
}

Comment.prototype = {
    to_json: function() {
        return {
            id: this.id,
            text: this.text,
            user: this.user.to_json(),
            comments: this.comments.map(c => c.to_json()),
        };
    },
    to_json_with_context: function() {
        return {
            id: this.id,
            text: this.text,
            user: this.user.to_json(),
            poll: this.poll.to_json(),
        };
    },
    remove: function(r) {
        // skip the ceremony if this is called recursively
        // every comment has a parent so we don't have to check
        // if this.parent is null.
        if (!r) {
            const i = this.parent.comments.indexOf(this);
            this.parent.comments.splice(i, 1);
        }
        delete comments[this.id];
        this.comments.forEach(c => c.remove(true));
    },
};

module.exports = Comment;
