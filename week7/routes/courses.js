const express = require('express');

const { coursesController } = require('../controllers/index');

const { isAuth } = require('../middlewares/auth');

const router = express.Router();
const { getCourses, bookCourse, cancelCourseBooking } = coursesController;

router.get('/', isAuth, getCourses);
router.post('/:courseId', isAuth, bookCourse);
router.delete('/:courseId', isAuth, cancelCourseBooking);

module.exports = router;
