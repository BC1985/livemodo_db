const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const xss = require("xss");
const bcrypt = require("bcryptjs");

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
  hasUserWithUserName(db, username) {
    return db("users")
      .where({ username })
      .first()
      .then(user => !!user);
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain one uppercase, lowercase, number and special character";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  deleteUser(knex, id) {
    return knex("users")
      .from("users")
      .where({ id })
      .delete();
  },
  updateUser(knex, id, updatedFields) {
    return knex("users")
      .where("id", id)
      .update(updatedFields);
  },
  serializeUser(user) {
    return {
      id: user.id,
      first_name: xss(user.full_name),
      last_name: xss(user.last_name),
      username: xss(user.username),
      email: xss(user.email)
    };
  }
};

module.exports = { userServices };
