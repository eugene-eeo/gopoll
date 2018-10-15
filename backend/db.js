const User = require('./models/user.js');

const users = {
    "doctorwhocomposer": new User({
        username: "doctorwhocomposer",
        forename: "Delia",
        surname:  "Derbyshire",
        password: "doctor",
    }),
};

module.exports = {
    users,
};
