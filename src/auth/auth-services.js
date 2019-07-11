const bcrypt = require("bcryptjs");

const AuthService = {
  getUserByUserName(knex, username) {
    return knex("users")
      .where({ username })
      .first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  parseBasicToken(token) {
    return Buffer.from(token, "base64")
      .toString()
      .split(":");
  }
};

module.exports = AuthService;
