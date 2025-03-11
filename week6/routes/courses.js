const express = require('express');

const { dataSource } = require('../db/data-source');

const { isAuth } = require('../middlewares/auth');

const { isNotValidUUID } = require('../utils/validators');
const handleErrorAsync = require('../utils/handle-error-async');
const appError = require('../utils/app-error');

const { BookingStatus } = require('../lib/enums');

const router = express.Router();
const CourseRepo = dataSource.getRepository('Course');
const CreditPurchaseRepo = dataSource.getRepository('CreditPurchase');
const CourseBookingRepo = dataSource.getRepository('CourseBooking');

const {
	BOOKED,
	CANCELLED,
} = BookingStatus;

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

router.post('/:courseId', isAuth, handleErrorAsync(async (req, res, next) => {
	const { id: userId } = req.user;
	const { courseId } = req.params;

	if (isNotValidUUID(courseId)) {
		return next(appError(400, 'ID錯誤'));
	}

	const purchasedCredits = await CreditPurchaseRepo.sum('purchased_credits', { user_id: userId });
	const bookedCourses = await CourseBookingRepo.count({
		user_id: userId,
		status: BOOKED,
	});

	if (purchasedCredits <= bookedCourses) {
		return next(appError(400, '已無可使用堂數'));
	}

	const { max_participants } = await CourseRepo.findOneBy({ id: courseId });
	const bookedParticipants = await CourseBookingRepo.count({
		course_id: courseId,
		status: BOOKED,
	});

	if (bookedParticipants >= max_participants) {
		return next(appError(400, '已達最大參加人數，無法參加'));
	}

	const hasBookedThisCourse = await CourseBookingRepo.findOneBy({
		user_id: userId,
		course_id: courseId,
		status: BOOKED,
	});

	if (hasBookedThisCourse) {
		return next(appError(400, '已經報名過此課程'));
	}

	const newBooking = CourseBookingRepo.create({
		user_id: userId,
		course_id: courseId,
	});

	await CourseBookingRepo.save(newBooking);

	res.status(201).json({
		status: 'success',
		data: null,
	});
}));

router.delete('/:courseId', isAuth, handleErrorAsync(async (req, res, next) => {
	const { id: userId } = req.user;
	const { courseId } = req.params;

	if (isNotValidUUID(courseId)) {
		return next(appError(400, 'ID錯誤'));
	}

	const foundCourse = await CourseRepo.findOneBy({ id: courseId });

	if (!foundCourse) {
		return next(appError(400, '課程不存在'));
	}

	const foundBookedRecord = await CourseBookingRepo.findOneBy({
		user_id: userId,
		course_id: courseId,
		status: BOOKED,
	});

	if (!foundBookedRecord) {
		return next(appError(400, '未報名此課程'));
	}

	const updatedBooking = await CourseBookingRepo.update({ id: foundBookedRecord.id }, {
		status: CANCELLED,
		cancelled_at: new Date(),
	});

	if (updatedBooking.affected === 0) {
		return next(appError(400, '取消報名失敗'));
	}

	res.status(200).json({
		status: 'success',
		data: null,
	});
}))

module.exports = router;
