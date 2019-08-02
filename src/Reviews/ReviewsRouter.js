const express = require("express");
const reviewsRouter = express.Router();
const { reviewsServices } = require("./reviewsServices");
const jsonParser = express.json();
const { requireAuth } = require("../Middleware/jwt-auth");

reviewsRouter.route("/").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  reviewsServices
    .getAllReviews(knexInstance)
    .then(reviews => {
      res.json(reviews);
    })
    .catch(next);
});

reviewsRouter.route("/").post(requireAuth, jsonParser, (req, res, next) => {
  const knexInstance = req.app.get("db");

  const {
    tagline,
    band_name,
    venue,
    show_date,
    content,
    posted,
    rating
  } = req.body;
  const newReview = {
    tagline,
    band_name,
    venue,
    posted,
    show_date,
    content,
    rating
  };
  for (const [key, value] of Object.entries(newReview))
    if (value === null) {
      return res.status(400).json({
        error: { message: `Missing ${key} in request body` }
      });
    }
  newReview.user_id = req.user.id;
  newReview.username = req.user.username;
  reviewsServices
    .postReview(knexInstance, newReview)
    .then(review => {
      const dbReview = review[0];
      res.status(201).json(dbReview);
    })
    .catch(next);
});

reviewsRouter
  .route("/:id")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    reviewsServices
      .getReviewById(knexInstance, id)
      .then(review => {
        if (!review || review.length === 0) {
          res.status(404).json({ error: { message: "Review doesn't exist" } });
        } else {
          res.status(200).json(review[0]);
        }
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    reviewsServices
      .deleteReview(knexInstance, id)
      .then(id => {
        if (!id) {
          res.status(404).json({ error: { message: "Review doesn't exist" } });
        }
        res.status(204).send(`Review with id ${id} deleted`);
      })
      .catch(next);
  })
  .put(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    const {
      band_name,
      tagline,
      venue,
      username,
      show_date,
      content,
      rating
    } = req.body;
    const reviewToUpdate = {
      tagline,
      band_name,
      venue,
      username,
      show_date,
      content,
      rating
    };
    const numberOfValues = Object.values(reviewToUpdate).filter(Boolean).length;
    if (numberOfValues == 0) {
      res.status(400).json({
        error: {
          message:
            "Request body must contain either band name, venue, rating or date"
        }
      });
    }
    reviewsServices
      .updateReviewById(knexInstance, id, reviewToUpdate)
      .then(() => {
        res.status(204).send(`Review with ID ${id} updated`);
      })
      .catch(next);
  });

reviewsRouter.route("/by_user/:user_id").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  const { user_id } = req.params;
  reviewsServices
    .getReviewFromUser(knexInstance, user_id)
    .then(review => {
      if (!review) {
        res.status(404).send(`User with id ${id} doesn't exist`);
      }
      res.status(200).json(review);
    })
    .catch(next);
});

module.exports = reviewsRouter;
