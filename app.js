const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser('secret'));

// routes
app.get('/ping', (req, res) => res.json(['pong']));
app.use('/people',  require('./routes/people'));
app.use('/auth',    require('./routes/auth'));
app.use('/poll',    require('./routes/polls'));
app.use('/comment', require('./routes/comments'));
app.use('/search',  require('./routes/search'));
app.use(express.static('frontend'));

// error handler for ValidationErrors
app.use(function(err, req, res, next) {
    if (err.name === 'JsonSchemaValidationError') {
        res.status(400);
        res.json({
            code:  'INVALID_SCHEMA',
            error: 'Invalid schema.',
            details: err.validationErrors.body,
        });
    } else {
        next(err);
    }
});


const db = require('./db');
const Poll = require('./models/poll');

db.polls[1] = new Poll({
    id: 1,
    name: "Login Information",
    description: "Password for @eeojun is \"abc\", and @doctorwhocomposer is \"doctor\".",
    multi: false,
    user: db.users['eeojun'],
});

module.exports = app;
