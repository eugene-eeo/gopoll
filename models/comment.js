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
};

module.exports = Comment;
