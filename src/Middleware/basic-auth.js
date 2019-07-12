const AuthService = require("../auth/auth-services");

function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";

  if (!authToken.toLowerCase().startsWith("basic ")) {
    return res.status(401).json({ error: "Missing basic token" });
  }
  return AuthService.comparePasswords(tokenPassword, user.password).then(
    passwordsMatch => {
      if (!passwordsMatch) {
        return res.status(401).json({
          error: "Unauthorized request"
        });
      }
      next();
    }
  );
}

module.exports = { requireAuth };
