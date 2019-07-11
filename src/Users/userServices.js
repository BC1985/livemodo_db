const userServices = {
  getAllUsers(knex) {
    return knex.select("*").from("users");
  },
  getUserById(knex, id) {
    return knex
      .from("users")
      .select("*")
      .where("id", id);
  },
  getUserByUserName(knex, username) {
    return knex
      .from("users")
      .where({ username })
      .first();
  },
  createNewUser(knex, newUser) {
    return knex("users")
      .returning(["first_name", "last_name", "username", "rating"])
      .insert(newUser);
  },
  deleteUser(knex, id) {
    return knex("users")
      .where("id", id)
      .delete();
  },
  updateUser(knex, id, updatedFields) {
    return knex("users")
      .where("id", id)
      .update(updatedFields);
  }
};

module.exports = { userServices };
