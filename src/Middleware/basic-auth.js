function requireAuth(req, res, next) {
  Review;
  console.log("requireAuth");
  console.log(req.get.authorization);
  next();
}

module.exports = { requireAuth };
