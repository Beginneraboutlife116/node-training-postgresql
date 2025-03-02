const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');

const {
	isNotValidString,
	isNotValidInteger,
	isNotValidImageURL,
	isNotValidUUID,
} = require('../utils/validators');
const { USER_ROLE } = require('../lib/enums');

const UserRepo = dataSource.getRepository('User');
const CoachRepo = dataSource.getRepository('Coach');

const { COACH } = USER_ROLE;

router.post('/coaches/:userId', async (req, res, next) => {
	try {
		const { userId } = req.params;
		const { experience_years, description, profile_image_url } = req.body;

		if (isNotValidInteger(experience_years) || isNotValidString(description)) {
			res.status(400).json({
				status: 'failed',
				message: '欄位未填寫正確'
			});
			return;
		}

		if (profile_image_url !== '' && isNotValidImageURL(profile_image_url)) {
			res.status(400).json({
				status: 'failed',
				message: '欄位未填寫正確'
			});
			return;
		}

		if (isNotValidUUID(userId)) {
			res.status(400).json({
				status: 'failed',
				message: '使用者不存在'
			});
			return;
		}

		const foundUser = await UserRepo.findOne({
			where: { id: userId }
		})

		if (!foundUser) {
			res.status(400).json({
				status: 'failed',
				message: '使用者不存在'
			});
			return;
		}

		if (foundUser.role === COACH) {
			res.status(409).json({
				status: 'failed',
				message: '使用者已經是教練'
			});
			return;
		}

		const updateUserResult = await UserRepo.update({
			id: userId,
		}, { role: COACH });

		if (updateUserResult.affected === 0) {
			res.status(400).json({
				status: 'failed',
				message: '更新使用者失敗'
			});
			return;
		}

		const newCoach = CoachRepo.create({
			user_id: userId,
			experience_years,
			description,
			profile_image_url,
		})
		const coachResult = await CoachRepo.save(newCoach);
		const { name, role } = await UserRepo.findOne({
			where: { id: userId }
		})
		
		res.status(201).json({
			status: 'success',
			data: {
				user: {
					name,
					role,
				},
				coach: {
					id: coachResult.id,
					user_id: coachResult.user_id,
					experience_years: coachResult.experience_years,
					description: coachResult.description,
					profile_image_url: coachResult.profile_image_url,
				}
			}
		})
	} catch (error) {
		logger.error(error);
		next(error);
	}
});

module.exports = router;
