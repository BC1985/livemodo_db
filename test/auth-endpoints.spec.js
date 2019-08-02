const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Auth Endpoints", function() {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  describe(`POST /api/auth/login`, () => {
    const requiredFields = ["username", "password"];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: "Bob",
        password: "11AAaa!!"
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        beforeEach("insert users", () => {
          helpers.seedUsers(db, testUsers);
        });
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });

    it(`responds 400 'invalid username' when bad username`, () => {
      const userInvalidUser = {
        username: "bad-username",
        password: testUser.password
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect username` });
    });

    it(`responds 400 'invalid password' when bad password`, () => {
      const userInvalidPass = {
        username: testUser.username,
        password: "incorrect"
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidPass)
        .expect(400, { error: `Incorrect username or password` });
    });

    it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
      const userValidCreds = {
        username: testUser.username,
        password: testUser.password
      };
      const expectedToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: "HS256"
        }
      );
      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});
