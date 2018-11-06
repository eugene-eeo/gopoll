const uuidv4 = require('uuid/v4');


function Activity({user, type, poll, comment, meta, is_private}) {
    this.id = uuidv4();
    this.user = user;
    this.type = type;
    this.poll = poll;
    this.comment = comment;
    this.meta = meta || (() => null);
    this.is_private = is_private;
}

Activity.types = {
    COMMENT_ON_POLL:  'COMMENT_ON_POLL',
    REPLY_TO_COMMENT: 'REPLY_TO_COMMENT',
    CREATE_POLL:      'CREATE_POLL',
    FINALIZE_POLL:    'FINALIZE_POLL',
    VOTE:             'VOTE',
    UNVOTE:           'UNVOTE',
};

Activity.from_comment = (comment) => {
    return new Activity({
        is_private: false,
        user: comment.user,
        poll: comment.poll,
        comment: comment,
        type: (comment.parent.poll  // check if parent is poll/comment
            ? Activity.types.REPLY_TO_COMMENT
            : Activity.types.COMMENT_ON_POLL),
    });
};

Activity.from_poll = (poll) => {
    return new Activity({
        is_private: false,
        user: poll.user,
        poll: poll,
        type: Activity.types.CREATE_POLL,
    });
};

Activity.from_finalize = (poll) => {
    return new Activity({
        is_private: false,
        user: poll.user,
        poll: poll,
        type: Activity.types.FINALIZE_POLL,
    });
};

Activity.from_vote = (user, poll, option) => {
    return new Activity({
        is_private: true,
        user: user,
        poll: poll,
        type: Activity.types.VOTE,
        meta: () => option.name,
    });
};

Activity.from_unvote = (user, poll, option) => {
    return new Activity({
        is_private: true,
        user: user,
        poll: poll,
        type: Activity.types.UNVOTE,
        meta: () => option.name,
    });
};

Activity.prototype = {
    related_to: function(user) {
        return this.viewable_by(user) && (this.user === user
            || this.poll.user === user
            || (this.comment
                && this.comment.parent
                && this.comment.parent.user === user)
        );
    },
    viewable_by: function(user) {
        return (this.is_private
            ? this.user === user
            : true);
    },
    to_json: function() {
        return {
            id:         this.id,
            user:       this.user.to_json(),
            poll:       this.poll.to_json(),
            type:       this.type,
            meta:       this.meta(),
            is_private: this.is_private,
        };
    },
};

module.exports = Activity;
