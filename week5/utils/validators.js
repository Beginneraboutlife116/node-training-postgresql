const isString = require('lodash/isString')
const isInteger = require('lodash/isInteger')
const isUndefined = require('lodash/isUndefined')
const { validate: uuidValidate } = require('uuid')
const dayjs = require('dayjs')

const isNotValidString = (value) => isUndefined(value) || !isString(value) || value.trim() === '';

const isNotValidInteger = (value) => isUndefined(value) || !isInteger(value) || value < 0;

const isNotValidUUID = (value) => isNotValidString(value) || !uuidValidate(value);

const isNotValidEmail = (value) => isNotValidString(value) || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

const isNotValidPassword = (value) => isNotValidString(value) || !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/.test(value);

const isNotValidImageURL = (value) => isNotValidString(value) || !(/\.(jpg|png)$/.test(value));

const isNotValidDate = (value) => isNotValidString(value) || !dayjs(value).isValid();

const isNotValidURL = (value) => isNotValidString(value) || !(/^(http|https):\/\/[^ "]+$/.test(value));

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
