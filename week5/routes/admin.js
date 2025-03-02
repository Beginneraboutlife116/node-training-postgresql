const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');

const {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID,
	isNotValidImageURL,
	isNotValidDate,
	isNotValidURL,
	isNotValidTimeStartAndEnd,
} = require('../utils/validators');
const errorHandler = require('../utils/error-handler');
const { USER_ROLE } = require('../lib/enums');

const UserRepo = dataSource.getRepository('User');
const CoachRepo = dataSource.getRepository('Coach');
const SkillRepo = dataSource.getRepository('Skill');
const CourseRepo = dataSource.getRepository('Course');

const { COACH } = USER_ROLE;

router.post('/coaches/course', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const {
			user_id,
			skill_id,
			name,
			description,
			start_at,
			end_at,
			max_participants,
			meeting_url
		} = req.body;

		if (isNotValidString(name) ||
			isNotValidString(description) ||
			isNotValidString(meeting_url) ||
			isNotValidUUID(skill_id) ||
			isNotValidUUID(user_id) ||
			isNotValidInteger(max_participants)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidURL(meeting_url)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidDate(start_at) || isNotValidDate(end_at) || isNotValidTimeStartAndEnd(start_at, end_at)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		const foundUser = await UserRepo.findOne({
			where: { id: user_id }
		});
		const foundSkill = await SkillRepo.findOne({
			where: { id: skill_id }
		});

		if (!foundSkill) {
			wrappedErrorHandler(400, '教練專長不存在');
			return;
		}

		if (!foundUser) {
			wrappedErrorHandler(400, '使用者不存在');
			return;
		}

		if (foundUser.role !== COACH) {
			wrappedErrorHandler(400, '使用者尚未成為教練');
			return;
		}

		const newCourse = CourseRepo.create({
			user_id,
			skill_id,
			name,
			description,
			start_at,
			end_at,
			max_participants,
			meeting_url
		});
		const result = await CourseRepo.save(newCourse);

		res.status(201).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
})

router.put('/coaches/course/:courseId', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { courseId } = req.params;
		const {
			skill_id,
			name,
			description,
			start_at,
			end_at,
			max_participants,
			meeting_url
		} = req.body;

		if (isNotValidUUID(skill_id) ||
			isNotValidString(name) ||
			isNotValidString(description) ||
			isNotValidInteger(max_participants) ||
			isNotValidURL(meeting_url)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidDate(start_at) || isNotValidDate(end_at) || isNotValidTimeStartAndEnd(start_at, end_at)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidUUID(courseId)) {
			wrappedErrorHandler(400, '課程不存在');
			return;
		}

		const foundCourse = await CourseRepo.findOne({
			where: { id: courseId }
		});

		if (!foundCourse) {
			wrappedErrorHandler(400, '課程不存在');
			return;
		}

		const result = await CourseRepo.update({
			id: courseId
		}, {
			skill_id,
			name,
			description,
			start_at,
			end_at,
			max_participants,
			meeting_url
		});

		if (result.affected === 0) {
			wrappedErrorHandler(400, '更新課程失敗');
			return;
		}

		const updatedCourse = await CourseRepo.findOne({
			where: { id: courseId }
		});

		res.status(200).json({
			status: 'success',
			data: updatedCourse
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
});

router.post('/coaches/:userId', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { userId } = req.params;
		const { experience_years, description, profile_image_url } = req.body;

		if (isNotValidInteger(experience_years) || isNotValidString(description)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (profile_image_url !== '' && isNotValidImageURL(profile_image_url)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		if (isNotValidUUID(userId)) {
			wrappedErrorHandler(400, '使用者不存在');
			return;
		}

		const foundUser = await UserRepo.findOne({
			where: { id: userId }
		})

		if (!foundUser) {
			wrappedErrorHandler(400, '使用者不存在');
			return;
		}

		if (foundUser.role === COACH) {
			wrappedErrorHandler(409, '使用者已經是教練');
			return;
		}

		const updateUserResult = await UserRepo.update({
			id: userId,
		}, { role: COACH });

		if (updateUserResult.affected === 0) {
			wrappedErrorHandler(400, '更新使用者失敗');
			return;
		}

		const newCoach = CoachRepo.create({
			user_id: userId,
			experience_years,
			description,
			profile_image_url,
		});
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
