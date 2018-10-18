const { tokens, polls } = require('./db');


function error(res, message) {
    res.status(400).json({error: message});
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
    error(res, "login required");
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
};
