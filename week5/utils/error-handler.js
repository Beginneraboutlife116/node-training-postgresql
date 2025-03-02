module.exports = (res, statusCode, message) => {
	res.status(statusCode).json({
		status: 'failed',
		message,
	});
};
