const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser('secret'));

// routes
app.use('/people', require('./routes/people'));
app.use('/auth',   require('./routes/auth'));
app.use('/poll',   require('./routes/polls'));

app.listen(3000, () => {});
