require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const userRouter = require("./Users/userRouter");
const reviewsRouter = require("./Reviews/ReviewsRouter");
const authRouter = require("./auth/auth-router");
const app = express();

// const morganOption = NODE_ENV === "production";
app.use(morgan("dev"));
app.use(cors("*"));
app.use(helmet());
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
