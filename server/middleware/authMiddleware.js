
const { verifyToken } = require('../utils/jwt');
const cookie = require('cookie');

const getTokenFromReq = (req) => {
  // 1) check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // 2) check cookies (HttpOnly cookie)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parsed = cookie.parse(cookieHeader || '');
    if (parsed.auth_token) return parsed.auth_token;
  }
  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const user = verifyToken(token);
    // user payload contains: { id, role, username, email }
    req.user = { 
        _id: user.id, // Mapping for compatibility with existing routes expecting _id
        id: user.id,
        ...user 
    };
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
