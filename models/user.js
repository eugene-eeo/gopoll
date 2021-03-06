const User = function({username, forename, surname, password}) {
    this.username = username;
    this.password = password;
    this.forename = forename;
    this.surname = surname;
};

User.prototype = {
    to_json: function() {
        return {
            username: this.username,
            forename: this.forename,
            surname: this.surname,
        };
    },
};

module.exports = User;
