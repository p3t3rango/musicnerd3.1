const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbConnection = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = dbConnection;