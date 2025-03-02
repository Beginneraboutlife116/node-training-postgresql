const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')

const {
	isNotValidString,
	isNotValidUUID,
} = require('../utils/validators');

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
	try {
		const { name } = req.body
		const trimName = name.trim()

		if (isNotValidString(trimName)) {
			res.status(400).json({
				status: 'failed',
				message: '欄位未填寫正確',
			})
			return;
		}

		const isSkillExist = await SkillRepo.findOne({
			where: { name: trimName },
		})

		if (isSkillExist) {
			res.status(409).json({
				status: 'failed',
				message: '資料重複',
			})
			return;
		}

		const newSkill = await SkillRepo.create({
			name: trimName,
		})
		const result = await SkillRepo.save(newSkill)

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
	try {
		const { skillId } = req.params

		if (isNotValidUUID(skillId)) {
			res.status(400).json({
				status: 'failed',
				message: 'ID錯誤',
			})
			return;
		}

		const result = await SkillRepo.delete(skillId)

		if (result.affected === 0) {
			res.status(400).json({
				status: 'failed',
				message: 'ID錯誤',
			})
			return;
		}

		res.status(200).json({
			status: 'success',
		})
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

module.exports = router
