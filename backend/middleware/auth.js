const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Handle token expiration
        return res.status(401).json({ error: "Token expired", expired: true });
      }
      // Handle other errors
      return res.status(403).json({ error: "Invalid token" });
    }

    // Token is valid
    req.user = user; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
