const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL, DB_URL } = require("./config");

const db = knex({
  client: "pg",
  connection: DATABASE_URL
  // "postgresql://postgres@localhost/livemodo"
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
//
