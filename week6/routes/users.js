const express = require('express');
const bcrypt = require('bcrypt');

const config = require('../config/index');
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')

const {
	isNotValidString,
	isNotValidEmail,
	isNotValidPassword,
} = require('../utils/validators');
const appError = require('../utils/app-error');

const router = express.Router();
const UserRepo = dataSource.getRepository('User');

router.post('/signup', async (req, res, next) => {
	try {
		const { email, password, name } = req.body;

		if (isNotValidString(name) || isNotValidEmail(email) || isNotValidString(password)) {
			return next(appError(400, '欄位未填寫正確'));
		}

		if (isNotValidPassword(password)) {
			return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
		}

		const isEmailExist = await UserRepo.findOneBy({ email });

		if (isEmailExist) {
			return next(appError(409, 'Email已被使用'));
		}

		const hashPassword = await bcrypt.hash(password, config.get('crypt.saltRounds'));
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
