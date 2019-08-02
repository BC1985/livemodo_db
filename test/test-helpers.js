const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      user_id: 1,
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
      user_id: 2,
      rating: 3,
      username: "username2"
    }
  ];
}
function makeUsersArray() {
  return [
    {
      id: 1,
      username: "test-user-1",
      first_name: "Test user 1",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 2,
      username: "test-user-2",
      first_name: "Test user 2",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 3,
      username: "test-user-3",
      first_name: "Test user 3",
      last_name: "test last name 3",
      password: "password",
      email: "test@email.com"
    }
  ];
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ id: user.id }, secret, {
    subject: user.username,

    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

function cleanTables(db) {
  return db.transaction(trx => {
    trx.raw(`TRUNCATE TABLE users CASCADE;`);
  });
}
function seedUsers(db) {
  const testUsers = [
    {
      id: 1,
      username: "test-user-1",
      first_name: "Test user 1",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 2,
      username: "test-user-2",
      first_name: "Test user 2",
      last_name: "test last name 2",
      password: "password",
      email: "test@email.com"
    },
    {
      id: 3,
      username: "test-user-3",
      first_name: "Test user 3",
      last_name: "test last name 3",
      password: "password",
      email: "test@email.com"
    }
  ];
  const preppedUsers = testUsers.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into("users").insert(preppedUsers);
}

module.exports = {
  makeReviewsArray,
  makeUsersArray,
  cleanTables,
  makeAuthHeader,
  seedUsers
};
