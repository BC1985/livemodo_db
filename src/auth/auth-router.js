const express = require("express");
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require("./auth-services");

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
      return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(console.log(dbUser.password))
        .then(compareMatch => {
          if (!compareMatch) {
            return res.status(400).json({
              error: "Incorrect username or password"
            });
          }
          const sub = dbUser.username;
          const payload = { id: dbUser.id };
          res.send({
            authToken: AuthService.createJwt(sub, payload)
          });
        });
    })
    .catch(next);
});

// authRouter.route("/").post(verifyToken, (req, res) => {
//   AuthService.verifyJwt;
// });

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken(next);
  } else {
    res.status(403).send("forbidden");
  }
}
module.exports = authRouter;
