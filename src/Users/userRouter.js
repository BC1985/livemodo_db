const express = require("express");
const jsonParser = express.json();
const { userServices } = require("./userServices");
const userRouter = express.Router();

userRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    userServices
      .getAllUsers(knexInstance)
      .then(users => res.json(users))
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { first_name, last_name, username, password } = req.body;
    const newUser = { first_name, last_name, username, password };

    for (const [key, value] of Object.entries(newUser))
      if (value === null) {
        res.status(400).res.json({
          error: { message: `Missing ${key} in request body` }
        });
      }
    const passwordError = userServices.validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    userServices
      .hasUserWithUserName(knexInstance, username)
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `username already taken` });
        return userServices.hashPassword(password).then(hashPassword => {
          const newUser = {
            username,
            password: hashPassword,
            first_name,
            last_name
          };

          return userServices
            .inserUSer(req.app.get("db"), newUser)
            .then(user => {
              res.status(201).json(userServices.serializeUser(user));
            });
        });
      })
      .catch(next);
  });
userRouter
  .route("/:id")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    userServices
      .getUserById(knexInstance, id)
      .then(id => {
        res.json(id);
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    userServices
      .deleteUser(knexInstance, id)
      .then(() => {
        res
          .status(204)
          .send("deleted")
          .end();
      })
      .catch(next);
  })
  .put(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    const { first_name, last_name, username } = req.body;
    const userToUpdate = { first_name, last_name, username };
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: "must contain at least one field" }
      });
    }
    userServices
      .updateUser(knexInstance, id, userToUpdate)
      .then(() => {
        res.status(200).send(`user with id ${id} updated`);
      })
      .catch(next);
  });

module.exports = userRouter;
