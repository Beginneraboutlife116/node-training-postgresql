const express = require('express')

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('Skill')
const appError = require('../utils/app-error');
const {
	isNotValidString,
	isNotValidUUID,
} = require('../utils/validators');

const router = express.Router();
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
	const { name } = req.body

	if (isNotValidString(name)) {
		return next(appError(400, '欄位未填寫正確'));
	}

	try {
		const isSkillExist = await SkillRepo.findOneBy({ name });

		if (isSkillExist) {
			return next(appError(409, '資料重複'));
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
	const { skillId } = req.params

	if (isNotValidUUID(skillId)) {
		return next(appError(400, 'ID錯誤'));
	}

	try {
		const result = await SkillRepo.delete(skillId)

		if (result.affected === 0) {
			return next(appError(400, 'ID錯誤'));
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
