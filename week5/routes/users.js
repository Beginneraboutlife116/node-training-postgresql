const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')

const {
	isNotValidString,
	isNotValidEmail,
	isNotValidPassword,
} = require('../utils/validators');
const errorHandler = require('../utils/error-handler');

const UserRepo = dataSource.getRepository('User');

const saltRounds = 10;

router.post('/signup', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { email, password, name } = req.body

		if (isNotValidString(name) || isNotValidEmail(email) || isNotValidString(password)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidPassword(password)) {
			wrappedErrorHandler(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字');
			return;
		}

		const isEmailExist = await UserRepo.findOne({
			where: { email }
		})

		if (isEmailExist) {
			wrappedErrorHandler(409, 'Email已被使用');
			return;
		}

		const hashPassword = await bcrypt.hash(password, saltRounds);
		const newUser = UserRepo.create({
			name,
			email,
			password: hashPassword,
		});

		const result = await UserRepo.save(newUser);

		res.status(201).json({
			status: 'success',
			data: {
				user: {
					id: result.id,
					name: result.name,
				}
			}
		})
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

module.exports = router
