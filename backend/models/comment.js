function Comment({id, text, user}) {
    this.id = id;
    this.text = text;
    this.user = user;
    this.comments = [];
    this.parent = null;
}

Comment.prototype = {
    to_json: function(x) {
        return {
            id: this.id,
            text: this.text,
            user: this.user.to_json(),
            comments: this.comments.map(c => c.to_json()),
        };
    }
};

module.exports = Comment;
