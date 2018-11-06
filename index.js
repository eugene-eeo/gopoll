const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser('secret'));

// routes
app.use('/', express.static('frontend'));
app.use('/api/people',   require('./routes/people'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/poll',     require('./routes/polls'));
app.use('/api/comment',  require('./routes/comments'));
app.use('/api/search',   require('./routes/search'));
app.use('/api/activity', require('./routes/activity'));

app.listen(3000, () => {});
