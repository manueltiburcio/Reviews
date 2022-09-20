const express = require('express');
require("dotenv").config();
const date = require('date-and-time')
const client = require('../models/dbpg.js');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());


const reviewsRoute = require('../routes/reviews');
app.use('/reviews', reviewsRoute);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

client.connect();