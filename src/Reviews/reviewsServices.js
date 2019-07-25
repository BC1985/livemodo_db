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
        "username",
        "show_date",
        "content",
        "rating"
      ])
      .from("reviews")
      .insert(review);
  },
  getReviewById(knex, id) {
    return knex("reviews")
      .from("reviews")
      .select("*")
      .where("id", id);
  },
  deleteReview(knex, id) {
    return knex("reviews")
      .from("reviews")
      .where({ id })
      .del();
  },
  updateReviewById(knex, id, updatedFields) {
    return knex("reviews")
      .from("reviews")
      .where("id", id)
      .update(updatedFields);
  }
};

module.exports = { reviewsServices };
