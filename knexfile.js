// Update with your config settings.
require("dotenv").config();
const config = require("./src/config");
module.exports = {
  client: "pg",
  connection: process.env.PROD_DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  tableName: "migrations",
  ssl: true
};
