// const knex = require("knex");
// const bcrypt = require("bcryptjs");
// const app = require("../src/app");
// const helpers = require("./test-helpers");
// const { userServices } = require("../src/Users/userServices");
// // const testUsers = require("../test/test-helpers");

// describe("Users Endpoints", function() {
//   let db;
//   const testUsers = [
//     {
//       id: 1,
//       username: "Derek Zoolander",
//       first_name: "Derek",
//       last_name: "Zoolander",
//       password: "$2a$12$FbxELqptGNyLYlXHFvDlK.v7ltcm6pVfQ/jqJuPNNxvRnjlNdejPe",
//       email: "zoolander@goodlooking.com"
//     },
//     {
//       id: 2,
//       username: "Boop",
//       first_name: "Betty",
//       last_name: "Boop",
//       password: "$2a$12$JOMHIeJ5U2gnUUb02jk4zeOHuHt4qopiylmaTbRzK0EocdiXdBMj.",
//       email: "betty@boop"
//     },
//     {
//       id: 3,
//       username: "Bad Mothaf***a",
//       first_name: "Jules",
//       last_name: "Winfield",
//       password: "$2a$12$3yeFr1aX4CmGWwbYSjkZaeAp1SUFV2SQEkriFbBxmcJR0N50PCQZO",
//       email: "jules@pulp.com"
//     }
//   ];
//   before("make knex instance", () => {
//     db = knex({
//       client: "pg",
//       connection: process.env.TEST_DB_URL
//     });
//     app.set("db", db);
//   });
//   before(() => {
//     return db.into("users").insert(testUsers);
//   });
//   after("disconnect from db", () => db.destroy());
//   beforeEach(() => db("users").truncate());

//   describe("Get all users", () => {
//     context(`Given 'users' has data`, () => {
//       before(() => {
//         return db.into("users").insert(testArticles);
//       });
//       it("return all users", () => {
//         return userServices.getAllUsers(db).then(actual => {
//           expect(actual).to.eql(testUsers);
//         });
//       });
//     });
//   });
// });
