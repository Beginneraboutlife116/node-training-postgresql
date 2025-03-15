const express = require('express');

const { usersController } = require('../controllers/index');

const { isAuth } = require('../middlewares/auth');

const router = express.Router();
const {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserPurchasedCreditPackages,
  getUserBookCourses,
} = usersController;

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', isAuth, getUserProfile);
router.put('/profile', isAuth, updateUserProfile);
router.put('/password', isAuth, updateUserPassword);
router.get('/credit-package', isAuth, getUserPurchasedCreditPackages);
router.get('/courses', isAuth, getUserBookCourses);

module.exports = router;
