const express = require('express');

const { adminController } = require('../controllers/index');

const { isAuth, isCoach, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const { createCourseByCoach, updateCourseByCoach, updateUserAsCoach, updateUserAsAdmin } = adminController;

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          name,
          role,
        },
        coach: coachResult,
      },
    });
  })
);
router.post('/coaches/course', [isAuth, isCoach], createCourseByCoach);
router.put('/coaches/course/:courseId', [isAuth, isCoach], updateCourseByCoach);
router.post('/coaches/:userId', [isAuth, isAdmin], updateUserAsCoach);

module.exports = router;
