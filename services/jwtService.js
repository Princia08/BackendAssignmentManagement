const jwt = require('jsonwebtoken');

class JwtService {
    sign(user) {
        return jwt.sign({ user }, process.env.JWT_SECRET);
    }

    verify(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token verification failed:', error);
            return error;
        }
    }
}

module.exports = new JwtService();