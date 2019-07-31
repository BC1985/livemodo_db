const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  return `bearer ${token}`;
}

function cleanTables(db) {
  return db.transaction(trx => trx.raw(`TRUNCATE users`));
}
function seedUsers(db, testUsers) {
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
  makeUsersArray,
  cleanTables,
  makeAuthHeader,
  seedUsers
};
