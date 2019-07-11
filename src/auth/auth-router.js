const express = require("express");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require("./auth-services");

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { username, password } = req.body;
  const loginUser = { username, password };
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing ${key} in request body`
      });
  AuthService.getUserByUserName(req.app.get("db"), loginUser)
    .then(dbUser => {
      if (!dbUser) {
        return res.status(400).json({
          error: "Incorrect username or password"
        });
      }
      res.send("ok");
    })
    .catch(next);
  // const user = {
  //   id: 1,
  //   name: "Ben",
  //   email: "ben@snailmail.com"
  // };
  jwt.sign({ user }, "secretkeyyall", (err, token) => {
    res.json({
      token
    });
  });
});

authRouter.route("/post-review").post(verifyToken, (req, res) => {
  jwt.verify(
    (req.token,
    "secretkeyyall",
    (err, authData) => {
      if (err) {
        res.status(403);
      } else {
        res.json({
          message: "post created",
          authData
        });
      }
    })
  );
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== undefinded) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken(next);
  } else {
    res.status(403).send("forbidden");
  }
}
module.exports = authRouter;
