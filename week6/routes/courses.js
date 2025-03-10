const express = require('express');

const { dataSource } = require('../db/data-source');
const handleErrorAsync = require('../utils/handle-error-async');

const router = express.Router();
const CourseRepo = dataSource.getRepository('Course');

router.get('/', handleErrorAsync(async(req, res, next) => {
	const courses = await CourseRepo.createQueryBuilder('ce')
		.innerJoin('ce.user', 'u')
		.innerJoin('ce.skill', 's')
		.select([
			'ce.id as id',
			'u.name as coach_name',
			's.name as skill_name',
			'ce.name as name',
			'description',
			'start_at',
			'end_at',
			'max_participants',
		])
		.getRawMany();
	
	res.status(200).json({
		status: 'success',
		data: courses,
	});
}));

module.exports = router;
