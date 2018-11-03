const { tokens, polls } = require('./db');


const error_codes = {
    NEEDS_AUTH:          'NEEDS_AUTH',
    NEEDS_REPLY:         'NEEDS_REPLY',
    ALREADY_LOGGED_IN:   'ALREADY_LOGGED_IN',
    INVALID_USERNAME:    'INVALID_USERNAME',
    INVALID_PASSWORD:    'INVALID_PASSWORD',
    POLL_FINALIZED:      'POLL_FINALIZED',
    USER_NOT_FOUND:      'USER_NOT_FOUND',
    POLL_NOT_FOUND:      'POLL_NOT_FOUND',
    OPTION_NOT_FOUND:    'OPTION_NOT_FOUND',
    COMMENT_NOT_FOUND:   'COMMENT_NOT_FOUND',
    POLL_DIFFERENT_USER: 'POLL_DIFFERENT_USER',
    CANNOT_VOTE:         'CANNOT_VOTE',
    HASNT_VOTED:         'HASNT_VOTED',
    USERNAME_TAKEN:      'USERNAME_TAKEN',
};


const error_messages = {
    NEEDS_AUTH:          'Login required.',
    NEEDS_REPLY:         'Needs a reply_to or poll_id.',
    ALREADY_LOGGED_IN:   'Already logged in.',
    INVALID_USERNAME:    'Invalid username.',
    INVALID_PASSWORD:    'Invalid password.',
    POLL_FINALIZED:      'Poll finalized.',
    USER_NOT_FOUND:      'User not found.',
    POLL_NOT_FOUND:      'Poll not found.',
    OPTION_NOT_FOUND:    'Option not found.',
    COMMENT_NOT_FOUND:   'Comment not found.',
    POLL_DIFFERENT_USER: 'Not allowed to modify poll.',
    CANNOT_VOTE:         'Cannot cast vote.',
    HASNT_VOTED:         'Hasn\'t voted.',
    USERNAME_TAKEN:      'Username is already taken.',
};


function error(res, code, status) {
    res.status(status || 400).json({
        code:  code,
        error: error_messages[code],
    });
}


function get_user(req) {
    return tokens[req.signedCookies.token];
}


function needs_auth(req, res, next) {
    if (tokens.hasOwnProperty(req.signedCookies.token)) {
        next();
        return;
    }
    res.clearCookie('token');
    error(res, error_codes.NEEDS_AUTH);
}


function polls_created_by_user(user) {
    return Object.values(polls)
        .filter(poll => poll.user === user)
        .map(x => x.to_json());
}


function polls_participated_by_user(user) {
    return Object.values(polls)
        .filter(poll => poll.has_vote_by(user))
        .map(x => x.to_json());
}


module.exports = {
    error,
    get_user,
    needs_auth,
    polls_created_by_user,
    polls_participated_by_user,
    error_codes,
};
