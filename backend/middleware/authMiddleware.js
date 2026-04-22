const jwt = require('jsonwebtoken');

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawKey, ...rawValueParts] = part.split('=');
    const key = rawKey.trim();
    if (!key) {
      return cookies;
    }

    cookies[key] = decodeURIComponent(rawValueParts.join('=').trim());
    return cookies;
  }, {});
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const cookies = parseCookieHeader(req.headers.cookie);
    token = cookies.auth_token || cookies.token || null;
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      authProvider: decoded.authProvider || 'ibm-app-id',
      ...decoded,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
