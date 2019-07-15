const express = require("express");
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require("./auth-services");
const { requireAuth } = require("../Middleware/jwt-auth");

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const knexInstance = req.app.get("db");
  const { username, password } = req.body;
  const loginUser = { username, password };
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing ${key} in request body`
      });
  AuthService.getUserByUserName(knexInstance, loginUser.username)
    .then(dbUser => {
      if (!dbUser) {
        return res.status(400).json({
          error: "Incorrect username"
        });
      }
      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then(compareMatch => {
        if (!compareMatch) {
          return res.status(400).json({
            error: "Incorrect username or password"
          });
        }
        const sub = dbUser.username;
        const payload = { id: dbUser.id };
        res.status(200).send({
          authToken: AuthService.createJwt(sub, payload)
        });
      });
    })
    .catch(next);
});

authRouter.post("/refresh", requireAuth, (req, res) => {
  const sub = req.user.username;
  const payload = { user_id: req.user.id };
  res.send({
    authToken: AuthService.createJwt(sub, payload)
  });
});

module.exports = authRouter;
