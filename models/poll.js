function Poll({id, name, description, multi, user}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.multi = multi;  // whether multiple options can be selected
    this.user = user;
    this.options = [];  // { id, name, users (private) }
    this.comments = [];
}

Poll.prototype = {
    to_json: function() {
        return {
            id:          this.id,
            name:        this.name,
            description: this.description,
            user:        this.user,
            multi:       this.multi,
        };
    },

    to_json_with_details: function(user) {
        const json = this.to_json();
        json.votes = this.options.map(opt => ({
            id:    opt.id,
            name:  opt.name,
            num:   opt.users.length,
            voted: opt.users.indexOf(user) !== -1,
        }));
        json.comments = this.comments.map(c => c.to_json());
        return json;
    },

    find_option: function(id) {
        return this.options.find(x => x.id === id);
    },

    can_vote: function(user) {
        // Multivote poll or the user has not cast a vote
        return this.multi || !this.has_vote_by(user);
    },

    has_vote_by: function(user) {
        return !!this.options.find(x => x.users.indexOf(user) !== -1);
    },
};

module.exports = Poll;
