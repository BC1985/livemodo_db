const reviewsServices = {
  getAllReviews(knex) {
    return knex.select("*").from("reviews");
  },

  getReviewFromUser(knex, user_id) {
    return knex
      .from("reviews")
      .select("*")
      .where({ user_id });
  },
  postReview(knex, review) {
    return knex
      .returning([
        "id",
        "tagline",
        "band_name",
        "venue",
        "user_id",
        "show_date",
        "content",
        "rating"
      ])
      .from("reviews")
      .insert(review);
  },
  getReviewById(knex, id) {
    return knex
      .from("reviews")
      .select("*")
      .where("id", id);
  },
  deleteReview(knex, id) {
    return knex
      .from("reviews")
      .where({ id })
      .del();
  }
};

module.exports = { reviewsServices };
