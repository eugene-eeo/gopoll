const { Validator } = require('express-json-validator-middleware');
const validator = new Validator();
const validate = validator.validate;

// users
const create_user_schema = {
    type: 'object',
    // special case to conform to spec.
    // this is the only public POST endpoint so this is ok.
    required: ['username', 'password', 'forename', 'surname', 'access_token'],
    properties: {
        username: {
            type: 'string',
            pattern: '^[a-zA-Z][A-Za-z0-9_]+$'
        },
        password: {type: 'string', minLength: 1},
        forename: {type: 'string', minLength: 1},
        surname:  {type: 'string', minLength: 1},
        access_token: {type: 'string'},
    },
};

const change_user_settings_schema = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            pattern: '^[a-zA-Z][A-Za-z0-9_]+$'
        },
        password: {type: 'string', minLength: 1},
        forename: {type: 'string', minLength: 1},
        surname:  {type: 'string', minLength: 1},
    },
};

const login_schema = {
    type: 'object',
    required: ['username', 'password'],
    properties: {
        username: {type: 'string'},
        password: {type: 'string'},
    },
};

// polls
const create_poll_schema = {
    type: 'object',
    required: ['name', 'description', 'multi'],
    properties: {
        name:        {type: 'string', minLength: 1},
        description: {type: 'string'},
        multi:       {type: 'boolean'},
    },
};

const update_poll_schema = {
    type: 'object',
    required: ['name', 'description', 'options'],
    properties: {
        name: {
            type: 'string',
            minLength: 1,
        },
        description: {type: 'string'},
        options: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                    id: {type: 'integer'},
                    name: {type: 'string', minLength: 1},
                },
            }
        }
    },
};

// comments
const create_comment_schema = {
    type: 'object',
    required: ['text'],
    properties: {
        text: {type: 'string', minLength: 1},
        poll_id: {type: 'integer'},
        reply_to: {type: 'string'},
    },
};

const update_comment_schema = {
    type: 'object',
    required: ['text'],
    properties: {
        text: {type: 'string', minLength: 1},
    },
};

// search
const search_schema = {
    type: 'object',
    required: ['q', 'include_users', 'include_polls', 'include_comments'],
    properties: {
        q: {type: 'string', minLength: 1},
        include_users:    {type: 'boolean'},
        include_polls:    {type: 'boolean'},
        include_comments: {type: 'boolean'},
    },
};

module.exports = {
    validate,
    create_user_schema,
    login_schema,
    create_poll_schema,
    update_poll_schema,
    create_comment_schema,
    update_comment_schema,
    search_schema,
};
