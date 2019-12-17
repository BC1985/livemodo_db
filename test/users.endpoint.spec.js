const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());
  describe("POST/ api/users", () => {
    context("User validation", () => {
      const requiredFields = [
        "username",
        "password",
        "first_name",
        "last_name",
        "email"
      ];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: "username",
          first_name: "first name",
          last_name: "last name",
          password: "11AAaa!!",
          email: "123@email.com"
        };
        it(`responds with 400 required error when '${field}' is missing`, done => {
          delete registerAttemptBody[field];
          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(
              400,
              {
                error: `Missing '${field}' in request body`
              },
              done()
            );
        });
      });
    });

    context("Happy path", () => {
      it("responds 201 serialized user, storing bcrypted password", () => {
        //run command 'TRUNCATE TABLE users CASCADE;' so this will pass
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
            expect(res.body).to.have.property("id");
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.first_name).to.eql(newUser.first_name);
            expect(res.body.last_name).to.eql(newUser.last_name);
            expect(res.body).to.not.have.property("password");
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
      const testUsers = helpers.makeUsersArray();
      const testUser = testUsers[0];
      const duplicateUser = {
        username: testUser.username,
        password: testUser.password,
        first_name: testUser.first_name,
        last_name: testUser.last_name
      };
      return supertest(app)
        .post("/api/users")
        .send(duplicateUser);
    });
  });
});
