const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')

const {
	isNotValidString,
	isNotValidUUID,
} = require('../utils/validators');
const errorHandler = require('../utils/error-handler');

const SkillRepo = dataSource.getRepository('Skill')

router.get('/', async (req, res, next) => {
	try {
		const skills = await SkillRepo.find({
			select: ['id', 'name'],
		})

		res.status(200).json({
			status: 'success',
			data: skills,
		})
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

router.post('/', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { name } = req.body

		if (isNotValidString(name)) {
			wrappedErrorHandler(400, '欄位未填寫正確');
			return;
		}

		const isSkillExist = await SkillRepo.findOne({
			where: { name },
		})

		if (isSkillExist) {
			wrappedErrorHandler(409, '資料重複');
			return;
		}

		const newSkill = SkillRepo.create({ name });
		const result = await SkillRepo.save(newSkill);

		res.status(201).json({
			status: 'success',
			data: {
				id: result.id,
				name: result.name,
			},
		})
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

router.delete('/:skillId', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { skillId } = req.params

		if (isNotValidUUID(skillId)) {
			wrappedErrorHandler(400, 'ID錯誤');
			return;
		}

		const result = await SkillRepo.delete(skillId)

		if (result.affected === 0) {
			wrappedErrorHandler(400, 'ID錯誤');
			return;
		}

		res.status(200).json({
			status: 'success',
		});
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

module.exports = router
