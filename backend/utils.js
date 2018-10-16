const { users, polls } = require('./db');


function error(res, message) {
    res.status(400).json({error: message});
}


function get_user(req) {
    return users[req.signedCookies.login];
}


function needs_auth(req, res, next) {
    if (req.signedCookies.login !== undefined &&
        users.hasOwnProperty(req.signedCookies.login)) {
        next();
        return;
    }
    res.clearCookie('login');
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
