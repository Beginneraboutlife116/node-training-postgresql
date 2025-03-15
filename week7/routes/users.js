const express = require('express');

const { usersController } = require('../controllers/index');

const { isAuth } = require('../middlewares/auth');

const router = express.Router();
const { signup, login, getUserProfile, updateUserProfile, updateUserPassword } = usersController;

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', isAuth, getUserProfile);
router.put('/profile', isAuth, updateUserProfile);
router.put('/password', isAuth, updateUserPassword);

module.exports = router;
