const jwt = require('jsonwebtoken');

// 生成JWT令牌
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '24h'
  });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
  } catch (error) {
    return null;
  }
};

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
  
  req.user = decoded;
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware
};