const User = require('./models/user.js');

const users = {
    "doctorwhocomposer": new User({
        username: "doctorwhocomposer",
        forename: "Delia",
        surname:  "Derbyshire",
        password: "doctor",
    }),
};

const polls = {};
const comments = {};

module.exports = {
    users,
    polls,
    comments,
};
