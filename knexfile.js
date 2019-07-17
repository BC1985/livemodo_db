require("dotenv").config();
module.exports = {
  client: "pg",
  connection:
    "postgres://cvlujwrqzurgzu:5434d4d12f33a55ec416278172e07ceb4bd81b1e445143a06d07fb1e7c799289@ec2-174-129-226-232.compute-1.amazonaws.com:5432/dmoqgcft1g9cj",
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "migrations"
  },
  ssl: true
};
