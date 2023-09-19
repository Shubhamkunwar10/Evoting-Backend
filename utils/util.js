const jwt = require('jsonwebtoken');
// Protect routes using middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }
  
    jwt.verify(token, 'secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
  
      req.user = user;
      next();
    });
};

module.exports  = authenticateToken;