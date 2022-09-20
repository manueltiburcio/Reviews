const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: '112233',
  database: 'reviews'
})

module.exports = client;