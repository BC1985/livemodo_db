// const knex = require("knex");
// const jwt = require("jsonwebtoken");
// const app = require("../src/app");
// const helpers = require("./test-helpers");

// describe("Auth endpoints", () => {
//   let db;

//   function seedUsers(db, users) {
//     return db.into("users").insert(users);
//   }
//   before("make knex instance", () => {
//     db = knex({
//       client: "pg",
//       connection: process.env.TEST_DB_URL
//     });
//     app.set("db", db);
//   });
//   after("disconnect from db", () => db.destroy());
//   before("cleanup", () => helpers.cleanTables(db));
//   afterEach("cleanup", () => helpers.cleanTables(db));

//   describe("POST/ api/users", () => {
//     context("User validation", () => {
//       beforeEach("insert users", () => seedUsers(db, users));
//     });

//     const requiredFields = ["username", "password", "first_name", "last_name"];
//     requiredFields.forEach(field => {
//       const registerAttemptBody = {
//         username: "test username",
//         password: " test password",
//         first_name: "test first name",
//         last_name: "test last name"
//       };
//       it(`Responds with 400 required error when ${field} is missing`, () => {
//         delete registerAttemptBody[field];

//         return supertest(app)
//           .post("/api/users")
//           .send(registerAttemptBody)
//           .expect(400, {
//             error: `Missing ${field} in request body`
//           });
//       });
//     });

//   });
//   describe(`Protected endpoints`, () => {
//     beforeEach("insert users", () => seedUsers(db, users));
//     describe(`GET /api/users/:user_id`, () => {
//       it(`responds with 401 'Missing basic token' when no basic token`, () => {
//         return supertest(app)
//           .get(`/api/users/123`)
//           .expect(401, { error: `Missing basic token` });
//       });
//     });
//   });

//   describe("POST /api/auth/login", () => {
//     beforeEach("insert users", () => seedUsers(db, users));
//     const requiredFields = ["username", "password"];

//     requiredFields.forEach(field => {
//       const loginAttemptBody = {
//         username: users[0].username,
//         password: users[0].password
//       };
//       it(`responds with 400 required error when ${field} is missing`, () => {
//         delete loginAttemptBody[field];
//         return supertest(app)
//           .post("/api/auth/login")
//           .send(loginAttemptBody)
//           .expect(400, {
//             error: `Missing ${field} in request body`
//           });
//       });
//     });
//     it(`responds 400 'invalid username or password' when bad username`, () => {
//       const userInvalidUser = { username: "usernot", password: "existy" };
//       return supertest(app)
//         .post("/api/auth/login")
//         .send(userInvalidUser)
//         .expect(400, { error: `Incorrect username or password` });
//     });
//     it(`responds 400 'invalid username or password' when bad password`, () => {
//       const userInvalidPass = {
//         username: users[0].username,
//         password: "incorrect"
//       };
//       return supertest(app)
//         .post("/api/auth/login")
//         .send(userInvalidPass)
//         .expect(400, { error: `Incorrect username or password` });
//     });
//     it("repsonds 200 and JWT auth token using secret when valid credentials", () => {
//       const userValidCreds = {
//         username: users[0].username,
//         password: users[0].password
//       };
//       const expectedToken = jwt.sign(
//         { user_id: users[0].user_id },
//         process.env.JWT_SECRET,
//         {
//           subject: users[0].username,
//           algorithm: "HS256"
//         }
//       );
//       return supertest(app)
//         .post("/api/auth/login")
//         .send(userValidCreds)
//         .expect(200, {
//           authToken: expectedToken
//         });
//     });
//   });
// });
