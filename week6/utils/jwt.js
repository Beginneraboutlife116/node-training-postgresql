const jwt = require('jsonwebtoken');

const config = require('../config/index');

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
				return reject(err);
			}
			resolve(decoded);
		});
	});
}

module.exports = {
	generateToken,
	verifyToken,
};
