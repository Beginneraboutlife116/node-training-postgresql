const express = require('express');

const { adminController } = require('../controllers/index');

const { isAuth, isCoach, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const { createCourseByCoach, updateCourseByCoach, updateUserAsCoach, updateUserAsAdmin } = adminController;

router.post('/coaches/course', [isAuth, isCoach], createCourseByCoach);
router.put('/coaches/course/:courseId', [isAuth, isCoach], updateCourseByCoach);
router.post('/coaches/:userId', [isAuth, isAdmin], updateUserAsCoach);
router.post('/:userId', isAuth, updateUserAsAdmin);

module.exports = router;
