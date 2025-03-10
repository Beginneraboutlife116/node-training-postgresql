const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger')('Auth');

const UserRepo = dataSource.getRepository('User');

const BEARER = 'Bearer';

async function isAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith(BEARER)) {
		return next(appError(401, '你尚未登入'));
	}

	try {
		const token = authHeader.split(' ')[1];
		const decoded = await verifyToken(token);
		const foundUser = await UserRepo.findOneBy({ id: decoded.id });

		if (!foundUser) {
			return next(appError(401, '無效 Token'));
		}

		req.user = foundUser;
		next();
	} catch (error) {
		logger.error(error.message);
		next(error);
	}
}

module.exports = {
	isAuth,
}
