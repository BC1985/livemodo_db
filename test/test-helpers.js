const bcrypt = require("bcryptjs");
function makeUsersArray() {
  return [
    {
      user_id: 1,
      username: "test-user-1",
      first_name: "Test user 1",
      last_name: "test last name 2",
      password: "password"
    },
    {
      user_id: 2,
      username: "test-user-2",
      first_name: "Test user 2",
      last_name: "test last name 2",
      password: "password"
    },
    {
      user_id: 3,
      username: "test-user-3",
      first_name: "Test user 3",
      last_name: "test last name 3",
      password: "password"
    }
  ];
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    sub: user.name,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

function cleanTables(db) {
  return db.transaction(trx => trx.raw(`TRUNCATE users`));
}
function seedUsers(db, testUserss) {
  const testUsers = [
    {
      user_id: 1,
      username: "test-user-1",
      first_name: "Test user 1",
      last_name: "test last name 2",
      password: "password"
    },
    {
      user_id: 2,
      username: "test-user-2",
      first_name: "Test user 2",
      last_name: "test last name 2",
      password: "password"
    },
    {
      user_id: 3,
      username: "test-user-3",
      first_name: "Test user 3",
      last_name: "test last name 3",
      password: "password"
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
