const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL, DB_URL } = require("./config");

const db = knex({
  client: "pg",
  connection: DATABASE_URL
  // For local host replace DATABASE_URL with DB_URL
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
