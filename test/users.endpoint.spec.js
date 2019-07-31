const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", function() {
  //   const { testUsers } = helpers.makeUsersArray();
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });
  before("cleanup", () => helpers.cleanTables(db));
  after("disconnect from db", () => db.destroy());
  beforeEach("insert users", () => seedUsers(db));
  afterEach("cleanup", () => helpers.cleanTables(db));
  function seedUsers(db) {
    const testUsers = [
      {
        id: 1,
        username: "Bob",
        first_name: "Bob",
        last_name: "Smith",
        password: "11AAaa!!",
        email: "test1@email.com"
      },
      {
        id: 2,
        username: "John",
        first_name: "John",
        last_name: "Doe",
        password: "@@22BBbb",
        email: "test2@email.com"
      },
      {
        id: 3,
        username: "Jane",
        first_name: "Jane",
        last_name: "Doe",
        password: "##33CCcc",
        email: "test3@email.com"
      }
    ];
    const preppedUsers = testUsers.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }));
    return db.into("users").insert(preppedUsers);
  }
  describe("POST/ api/users", () => {
    // context("User validation", () => {

    // const requiredFields = [
    //   "username",
    //   "password",
    //   "first_name",
    //   "last_name",
    //   "email"
    // ];

    // requiredFields.forEach(field => {
    //   const registerAttemptBody = {
    //     username: "test username",
    //     first_name: "test first name",
    //     last_name: "test last name",
    //     password: "11AAaa!!",
    //     email: "123@email.com"
    //   };
    //   it(`responds with 400 required error when ${field} is missing`, () => {
    //     delete registerAttemptBody[field];
    //     return supertest(app)
    //       .post("/api/users")
    //       .send(registerAttemptBody)
    //       .expect(400, {
    //         error: `Missing '${field}' in request body`
    //       });
    //   });
    // });

    context("Happy path", () => {
      it("responds 201 serialized user, storing bcrypted password", () => {
        const newUser = {
          username: "test username",
          first_name: "test first name",
          last_name: "test last name",
          password: "11AAaa!!"
        };
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id") +
              expect(res.body.username).to.eql(newUser.username);
            expect(res.body.first_name).to.eql(newUser.first_name);
            expect(res.body.last_name).to.eql(user.last_name) +
              expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          })
          .expect(res =>
            db
              .from("users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                expect(row.first_name).to.eql(newUser.first_name);
                expect(row.last_name).to.eql(newUser.last_name);
                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });

    it(`responds 400 'password must be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        username: "test username",
        first_name: "test first name",
        last_name: "test last name",
        password: "1234567",
        email: "123@email.com"
      };
      return supertest(app)
        .post("/api/users")
        .send(userShortPassword)
        .expect(400, { error: "Password must be at least 8 characters" });
    });

    it(`responds 400 'Password must be less than 72 characters`, () => {
      const userLongPassword = {
        first_name: "test first name",
        password: "*".repeat(73),
        last_name: "test last name",
        username: "test username",
        email: "123@email.com"
      };
      return supertest(app)
        .post("/api/users")
        .send(userLongPassword)
        .expect(400, {
          error: "Password must be less than 72 characters"
        });
    });
    it(`responds 400 error when password start with spaces`, () => {
      const userPasswordStartSpaces = {
        username: "test user name",
        password: " 11!!AAaa",
        first_nam: "test first name",
        last_name: "test last name"
      };
      return supertest(app)
        .post("/api/users")
        .send(userPasswordStartSpaces)
        .expect(400, {
          error: "Password must not start or end with empty spaces"
        });
    });
    it(`responds 400 error when password ends with space`, () => {
      const userPasswordEndSpaces = {
        username: "test username",
        password: "11AAaa## ",
        first_name: "test first name",
        last_name: "test last name"
      };
      return supertest(app)
        .post("/api/users")
        .send(userPasswordEndSpaces)
        .expect(400, {
          error: "Password must not start or end with empty spaces"
        });
    });
    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: "test username",
        first_name: "test first name",
        last_name: "test last name",
        password: "11AAaabb"
      };
      return supertest(app)
        .post("/api/users")
        .send(userPasswordNotComplex)
        .expect(400, {
          error: `Password must contain one uppercase, lowercase, number and special character`
        });
    });
    it(`responds 400 'username already taken when username isn't unique`, () => {
      const testUsers = [
        {
          id: 1,
          username: "Bob",
          first_name: "Bob",
          last_name: "Smith",
          password: "11AAaa!!",
          email: "test1@email.com"
        },
        {
          id: 2,
          username: "John",
          first_name: "John",
          last_name: "Doe",
          password: "@@22BBbb",
          email: "test2@email.com"
        }
      ];
      const duplicateUser = {
        username: testUsers[0].username,
        password: "11AAaa!!",
        first_name: "test first name",
        last_name: "test last name"
      };
      return supertest(app)
        .post("/api/users")
        .send(duplicateUser);
    });
  });
});
