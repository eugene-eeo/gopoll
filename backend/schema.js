const { Validator } = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;

// users
const create_user_schema = {
    type: 'object',
    required: ['username', 'password', 'forename', 'surname'],
    properties: {
        username: {
            type: 'string',
            pattern: '[a-zA-Z][A-Za-z0-9]+'
        },
        password: {type: 'string'},
        forename: {type: 'string'},
        surname:  {type: 'string'},
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
        name: {
            type: 'string',
            pattern: '[A-Za-z0-9][A-Za-z0-9 ]+'
        },
        description: {type: 'string'},
        multi: {type: 'boolean'},
    },
};

const update_poll_schema = {
    type: 'object',
    required: ['name', 'description', 'options'],
    properties: {
        name: {
            type: 'string',
            pattern: '[A-Za-z0-9][A-Za-z0-9 ]+'
        },
        description: {type: 'string'},
        options: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                    id: {type: 'integer'},
                    name: {type: 'string'},
                },
            }
        }
    },
};

module.exports = {
    validate,
    create_user_schema,
    login_schema,
    create_poll_schema,
    update_poll_schema,
};
