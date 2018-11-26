const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser('secret'));

// routes
app.use('/people',   require('./routes/people'));
app.use('/auth',     require('./routes/auth'));
app.use('/poll',     require('./routes/polls'));
app.use('/comment',  require('./routes/comments'));
app.use('/search',   require('./routes/search'));
app.use('/activity', require('./routes/activity'));
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

app.listen(3000, () => {});
