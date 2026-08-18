const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secretKey = process.env.JWT_SECRET || 'aura_stream_fallback_super_secret_jwt_key_2025';
      const decoded = jwt.verify(token, secretKey);
      
      // Attach user info to request object
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
