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
app.use('/people',  require('./routes/people'));
app.use('/auth',    require('./routes/auth'));
app.use('/poll',    require('./routes/polls'));
app.use('/comment', require('./routes/comments'));

app.listen(3000, () => {});
