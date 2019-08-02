const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function() {
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
  const protectedEndpoint = {
    name: "POST /api/reviews/",
    path: "/api/reviews/",
    method: supertest(app).post
  };

  describe(protectedEndpoint.name, () => {
    it(`responds 401 'Missing bearer token' when no bearer token`, () => {
      return protectedEndpoint
        .method(protectedEndpoint.path)
        .expect(401, { error: `Missing bearer token` });
    });

    it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
      const validUser = testUser;
      const invalidSecret = "bad-secret";
      return protectedEndpoint
        .method(protectedEndpoint.path)
        .set("Authorization", helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, { error: `Unauthorized request` });
    });

    it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
      const invalidUser = { username: "user-not-existy", id: 1 };
      return protectedEndpoint
        .method(protectedEndpoint.path)
        .set("Authorization", helpers.makeAuthHeader(invalidUser))
        .expect(401, { error: `Unauthorized request` });
    });
  });
});
