const jwt = require('jsonwebtoken');

const config = require('../config/index');

const appError = require('./app-error');

function generateToken(payload) {
  const token = jwt.sign(payload, config.get('secret.jwtSecret'), {
    expiresIn: config.get('secret.jwtExpiresIn'),
  });

  return token;
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.get('secret.jwtSecret'), (err, decoded) => {
      if (err) {
        switch (err.name) {
          case 'TokenExpiredError':
            reject(appError(401, 'Token 已過期'));
            break;

          case 'NotBeforeError':
            reject(appError(401, 'Token 尚未生效'));
            break;

          default:
            reject(appError(401, '無效的 Token'));
        }
        return;
      }
      resolve(decoded);
    });
  });
}

module.exports = {
  generateToken,
  verifyToken,
};
