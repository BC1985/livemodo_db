const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function() {
  let db;
  function makeReviewsArray() {
    return [
      {
        id: 1,
        tagline: "tagline",
        band_name: "band",
        venue: "venue",
        show_date: "2017-12-31T05:00:00.000Z",
        posted: "2017-12-31T05:00:00.000Z",
        content: "content",
        rating: 3,
        username: "username1"
      },
      {
        id: 2,
        tagline: "tagline",
        band_name: "band",
        venue: "venue",
        show_date: "2017-12-31T05:00:00.000Z",
        posted: "2017-12-31T05:00:00.000Z",
        content: "content",
        rating: 3,
        username: "username2"
      }
    ];
  }
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

  beforeEach("insert reviews", () => makeReviewsArray());

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
      const validUser = testUsers[0];
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
