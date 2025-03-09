const {
	isInt,
	isUUID,
	isEmail,
	isStrongPassword,
	isURL,
} = require('validator');
const dayjs = require('dayjs')

const isNotValidString = (value) => typeof value !== 'string' || value.trim() === '';

const isNotValidInteger = (value, options = {
	gt: 0,
}) => typeof value !== 'number' || !isInt(value.toString(), options);

const isNotValidUUID = (value) => isNotValidString(value) || !isUUID(value);

const isNotValidEmail = (value, options) => isNotValidString(value) || !isEmail(value, options);

const isNotValidPassword = (value, options = {
	minLength: 8,
	maxLength: 16,
	minLowercase: 1,
	minUppercase: 1,
	minNumbers: 1,
	minSymbols: 0,
}) => isNotValidString(value) || !isStrongPassword(value, options);

const isNotValidURL = (value, options) => isNotValidString(value) || !isURL(value, options);

const isNotValidImageURL = (value, options) => isNotValidURL(value, options) || !(/\.(jpg|png)$/.test(value));

const isNotValidDate = (value) => isNotValidString(value) || !dayjs(value).isValid();

const isNotValidTimeStartAndEnd = (start, end) => !dayjs(start).isBefore(end);

module.exports = {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID,
	isNotValidEmail,
	isNotValidPassword,
	isNotValidImageURL,
	isNotValidDate,
	isNotValidURL,
	isNotValidTimeStartAndEnd,
}
