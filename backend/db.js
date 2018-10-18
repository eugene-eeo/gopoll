const User = require('./models/user.js');

const users = {
    "doctorwhocomposer": new User({
        username: "doctorwhocomposer",
        forename: "Delia",
        surname:  "Derbyshire",
        password: "doctor",
    }),
    "shufay": new User({
        username: "shufay",
        forename: "Shu Fay",
        surname:  "Ung",
        password: "abc",
    }),
    "eeojun": new User({
        username: "eeojun",
        forename: "Jun",
        surname:  "Eeo",
        password: "abc",
    }),
};

const tokens = {};
const polls = {};
const comments = {};

module.exports = {
    users,
    tokens,
    polls,
    comments,
};
