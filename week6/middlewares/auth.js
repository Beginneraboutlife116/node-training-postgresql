const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger')('Auth');

const { Role } = require('../lib/enums');

const UserRepo = dataSource.getRepository('User');

const { COACH, ADMIN } = Role;

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

function isCoach(req, res, next) {
	const { user } = req;

	if (!user || user.role !== COACH) {
		return next(appError(401, '使用者尚未成為教練'));
	}

	next();
}

function isAdmin(req, res, next) {
	const { user } = req;

	if (!user || user.role !== ADMIN) {
		return next(appError(401, '使用者並非是管理員'));
	}

	next();
}

module.exports = {
	isAuth,
	isCoach,
	isAdmin,
}
