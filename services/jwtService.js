const jwt = require("jsonwebtoken");

class JwtService {
  sign(user) {
    return jwt.sign({ user }, process.env.JWT_SECRET);
  }

  verify(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.user;
    } catch (error) {
      console.error("Token verification failed:", error);
      return error;
    }
  }
}

module.exports = new JwtService();
