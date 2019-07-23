const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL, DB_URL } = require("./config");

const db = knex({
  client: "pg",
  // change below to DATABASE_URL for heroku connection
  connection: DATABASE_URL
  // "postgresql://postgres@localhost/livemodo"
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
//
