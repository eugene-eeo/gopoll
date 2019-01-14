const { polls } = require('../db');


function Poll({id, name, description, multi, user}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.multi = multi;  // whether multiple options can be selected
    this.user = user;
    this.options = [];  // { id, name, users (private) }
    this.comments = [];
    this.finalized = false;
}

Poll.prototype = {
    to_json: function() {
        return {
            id:          this.id,
            name:        this.name,
            description: this.description,
            user:        this.user,
            multi:       this.multi,
            finalized:   this.finalized,
        };
    },

    to_json_with_details: function(user) {
        return {
            ...this.to_json(),
            comments: this.comments.map(c => c.to_json()),
            votes: this.options.map(opt => ({
                id:    opt.id,
                name:  opt.name,
                num:   opt.users.length,
                voted: opt.users.indexOf(user) !== -1,
            })),
        };
    },

    max_id: function() {
        var max = 0;
        this.options.forEach(opt => {
            max = Math.max(max, opt.id);
        });
        return max;
    },

    finalize: function() {
        this.finalized = true;
    },

    find_option: function(id) {
        return this.options.find(x => x.id === id);
    },

    can_vote: function(user) {
        // Multivote poll or the user has not cast a vote
        return !this.finalized && (this.multi || !this.has_vote_by(user));
    },

    has_vote_by: function(user) {
        return !!this.options.find(x => x.users.indexOf(user) !== -1);
    },

    remove: function() {
        // remember to remove comments so that future searches won't give dead links
        delete polls[this.id];
        this.comments.forEach(c => c.remove(true));
    },
};

module.exports = Poll;
