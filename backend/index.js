const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(cookieParser('secret'));

// routes
app.use('/', express.static('frontend'));
app.use('/api/people',  require('./routes/people'));
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/poll',    require('./routes/polls'));
app.use('/api/comment', require('./routes/comments'));

app.listen(3000, () => {});
