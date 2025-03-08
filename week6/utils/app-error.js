module.exports = (status, errMessage) => {
	const error = new Error(errMessage)
	error.status = status;
	return error;
}
