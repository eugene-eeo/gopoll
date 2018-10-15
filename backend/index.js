const express = require('express');
const morgan = require('morgan');
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(express.json());

// routes
app.use('/people', require('./routes/people'));

app.listen(3000, () => {});
