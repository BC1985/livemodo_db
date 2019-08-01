const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

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
describe("Reviews Endpoints", function() {
  let db;
  //   const { testUsers } = helpers.makeUsersArray();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db.raw("TRUNCATE reviews"));

  afterEach("cleanup", () => db.raw("TRUNCATE reviews"));

  describe(`GET /api/reviews`, () => {
    context(`Given no reviews`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/reviews")
          .expect(200, []);
      });
    });

    context("Given there are reviews in the database", () => {
      const testUsers = helpers.makeUsersArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert reviews", () => {
        return db
          .into("reviews")
          .insert(testReviews)
          .then(() => {
            return db.into("reviews").insert(testReviews);
          });
      });

      it("responds with 200 and all of the reviews", () => {
        return supertest(app)
          .get("/api/reviews")
          .expect(200, testReviews);
      });
    });
  });

  describe(`GET /api/reviews/:review_id`, () => {
    context(`Given no reviews`, () => {
      it(`responds with 404`, () => {
        const ReviewId = 123456;
        return supertest(app)
          .get(`/api/reviews/${ReviewId}`)
          .expect(404, { error: { message: `Review doesn't exist` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testUsers = helpers.makeUsersArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert reviews", () => {
        return db
          .into("reviews")
          .insert(testReviews)
          .then(() => {
            return db.into("reviews").insert(testReviews);
          });
      });

      it("responds with 200 and the specified Review", () => {
        const ReviewId = 2;
        const expectedReview = testReviews[ReviewId - 1];
        return supertest(app)
          .get(`/api/reviews/${ReviewId}`)
          .expect(200, expectedReview);
      });
    });
  });

  describe(`POST /api/reviews`, () => {
    const testUsers = helpers.makeUsersArray();
    // beforeEach("insert malicious Review", () => {
    //   return db.into("users").insert(testUsers);
    // });

    it(`creates a review, responding with 201 and the new review`, () => {
      const newReview = {
        id: 2,
        tagline: "tagline",
        band_name: "band",
        venue: "venue",
        show_date: "2017-12-31T05:00:00.000Z",
        posted: "2017-12-31T05:00:00.000Z",
        content: "content",
        rating: 3,
        username: "username2"
      };
      return supertest(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(201)
        .expect(res => {
          expect(res.body.tagline).to.eql(newReview.tagline);
          expect(res.body.venue).to.eql(newReview.venue);
          expect(res.body.content).to.eql(newReview.content);
          expect(res.body.band_name).to.eql(newReview.band_name);
          expect(res.body.rating).to.eql(newReview.rating);
          expect(res.body.username).to.eql(newReview.username);
          expect(res.body.show_date).to.eql(newReview.show_date);
          expect(res.body.posted).to.eql(newReview.posted);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.posted)
          );
          expect(actual).to.eql(expected);
        })
        .then(res =>
          supertest(app)
            .get(`/api/reviews/${res.body.id}`)
            .expect(res.body)
        );
    });

    const requiredFields = [
      "tagline",
      "band_name",
      "venue",
      "show_date",
      "posted",
      "content",
      "rating",
      "username"
    ];

    requiredFields.forEach(field => {
      const newReview = {
        tagline: "tagline",
        band_name: "band",
        venue: "venue",
        show_date: "2017-12-31T05:00:00.000Z",
        posted: "2017-12-31T05:00:00.000Z",
        content: "content",
        rating: 3,
        username: "username1"
      };

      it(`responds with 400 and an error message when '${field}' is missing`, () => {
        delete newReview[field];

        return supertest(app)
          .post("/api/reviews")
          .set("Authorization", "bearer", helpers.makeAuthHeader(testUsers[0]))
          .send(newReview)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });

  describe(`DELETE /api/reviews/:review_id`, () => {
    context(`Given no reviews`, () => {
      it(`responds with 404`, () => {
        const ReviewId = 123456;
        return supertest(app)
          .delete(`/api/reviews/${ReviewId}`)
          .expect(404, { error: { message: `Review doesn't exist` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testUsers = helpers.makeUsersArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert reviews", () => {
        return db
          .into("reviews")
          .insert(testReviews)
          .then(() => {
            return db.into("reviews").insert(testReviews);
          });
      });

      it("responds with 204 and removes the review", () => {
        const idToRemove = 2;
        const expectedReviews = testReviews.filter(
          Review => Review.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/reviews/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/reviews`)
              .expect(expectedReviews)
          );
      });
    });
  });

  describe(`PATCH /api/reviews/:review_id`, () => {
    context(`Given no Reviews`, () => {
      it(`responds with 404`, () => {
        const ReviewId = 123456;
        return supertest(app)
          .delete(`/api/reviews/${ReviewId}`)
          .expect(404, { error: { message: `Review doesn't exist` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testUsers = helpers.makeUsersArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert reviews", () => {
        return db
          .into("reviews")
          .insert(testReviews)
          .then(() => {
            return db.into("reviews").insert(testReviews);
          });
      });

      it("responds with 204 and updates the Review", () => {
        const idToUpdate = 2;
        const updateReview = {
          tagline: "updated tagline",
          band_name: "band",
          venue: "venue",
          show_date: "2017-12-31T05:00:00.000Z",
          posted: "2017-12-31T05:00:00.000Z",
          content: "updated content",
          rating: 3,
          username: "username1"
        };
        const expectedReview = {
          ...testReviews[idToUpdate - 1],
          ...updateReview
        };
        return supertest(app)
          .patch(`/api/reviews/${idToUpdate}`)
          .send(updateReview)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/reviews/${idToUpdate}`)
              .expect(expectedReview)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/reviews/${idToUpdate}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must contain either band name, venue, rating or date`
            }
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateReview = {
          title: "updated Review title"
        };
        const expectedReview = {
          ...testReviews[idToUpdate - 1],
          ...updateReview
        };

        return supertest(app)
          .patch(`/api/reviews/${idToUpdate}`)
          .send({
            ...updateReview,
            fieldToIgnore: "should not be in GET response"
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/reviews/${idToUpdate}`)
              .expect(expectedReview)
          );
      });
    });
  });
});
