// json-schema validator
const { Validator } = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;

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

module.exports = {
    validate,
    create_user_schema,
};
