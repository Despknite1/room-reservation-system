const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "room_reservation_db",
  password: "Despknite",
  port: 5432,
});

module.exports = pool;