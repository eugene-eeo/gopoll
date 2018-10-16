function error(res, message) {
    res.status(400).json({error: message});
}


function needs_auth(req, res, next) {
    if (req.signedCookies.login !== undefined) {
        next();
        return;
    }
    error(res, "login required");
}


module.exports = {
    error,
    needs_auth,
};
