const isString = require('lodash/isString')
const isInteger = require('lodash/isInteger')
const isUndefined = require('lodash/isUndefined')
const { validate: uuidValidate } = require('uuid')

const isNotValidString = (value) => isUndefined(value) || !isString(value) || value.trim() === ''
const isNotValidInteger = (value) => isUndefined(value) || !isInteger(value) || value < 0
const isNotValidUUID = (value) => isNotValidString(value) || !uuidValidate(value)

module.exports = {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID
}
