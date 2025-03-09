const express = require('express');
const bcrypt = require('bcrypt');

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('User')
const appError = require('../utils/app-error');
const {
	isNotValidString,
	isNotValidEmail,
	isNotValidPassword,
} = require('../utils/validators');
const { generateToken } = require('../utils/jwt');

const router = express.Router();
const UserRepo = dataSource.getRepository('User');

router.post('/signup', async (req, res, next) => {
	const {
		email,
		password,
		name,
	} = req.body;

	if (isNotValidString(name) || isNotValidEmail(email)) {
		return next(appError(400, '欄位未填寫正確'));
	}

	if (isNotValidPassword(password)) {
		return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
	}

	try {
		const isEmailExist = await UserRepo.findOneBy({ email });

		if (isEmailExist) {
			return next(appError(409, 'Email已被使用'));
		}

		const hashPassword = await bcrypt.hash(password, config.get('secret.saltRounds'));
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

router.post('/login', async (req, res, next) => {
	const {
		email,
		password,
	} = req.body;

	if (isNotValidEmail(email)) {
		return next(appError(400, '欄位未填寫正確'));
	}

	if (isNotValidPassword(password)) {
		return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
	}

	try {
		const foundUser = await UserRepo.findOne({
			select: ['id', 'name', 'role', 'password'],
			where: { email }
		});

		if (!foundUser) {
			return next(appError(400, '使用者不存在或密碼輸入錯誤'));
		}

		const isMatch = await bcrypt.compare(password, foundUser.password);

		if (!isMatch) {
			return next(appError(400, '使用者不存在或密碼輸入錯誤'));
		}

		const token = generateToken({
			id: foundUser.id,
			role: foundUser.role,
		});

		res.status(201).json({
			status: 'success',
			data: {
				token,
				user: {
					name: foundUser.name,
				}
			}
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
})

module.exports = router
