const logger = require('../utils/logger')('User')

function handleErrorAsync(fn) {
	return (req, res, next) => {
		fn(req, res, next).catch((error) => {
			logger.error(error);
			next(error);
		});
	}
}

module.exports = handleErrorAsync;
