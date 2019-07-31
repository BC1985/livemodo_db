const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe("Auth Endpoints", function() {
  let db;
  const testUsers = [
    {
      id: 1,
      username: "test-user-1",
      first_name: "Test user 1",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 2,
      username: "test-user-2",
      first_name: "Test user 2",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 3,
      username: "test-user-3",
      first_name: "Test user 3",
      last_name: "test last name 3",
      password: "password",
      email: "test@email.com"
    }
  ];
  //   const testUsers = [
  //     {
  //       id: 1,
  //       username: "Bob",
  //       first_name: "Bob",
  //       last_name: "Smith",
  //       password: "11AAaa!!",
  //       email: "test1@email.com"
  //     },
  //     {
  //       id: 2,
  //       username: "John",
  //       first_name: "John",
  //       last_name: "Doe",
  //       password: "@@22BBbb",
  //       email: "test2@email.com"
  //     },
  //     {
  //       id: 3,
  //       username: "Jane",
  //       first_name: "Jane",
  //       last_name: "Doe",
  //       password: "##33CCcc",
  //       email: "test3@email.com"
  //     }
  //   ];
  const testUser = testUsers[0];
  function seedUsers(db, testUsers) {
    const preppedUsers = testUsers.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }));
    return db.into("users").insert(preppedUsers);
  }
  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /api/auth/login`, () => {
    beforeEach("insert users", () => seedUsers(db, testUsers));

    const requiredFields = ["username", "password"];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: "Bob",
        password: "11AAaa!!"
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });

    it(`responds 400 'invalid username or password' when bad username`, () => {
      const userInvalidUser = { username: "user-not", password: "existy" };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect username` });
    });

    it(`responds 400 'invalid username or password' when bad password`, () => {
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
