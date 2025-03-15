const express = require('express');
const { skillController } = require('../controllers/index');
const { isAuth } = require('../middlewares/auth');

const router = express.Router();
const { getSkills, createSkill, deleteSkill } = skillController;

router.get('/', isAuth, getSkills);
router.post('/', isAuth, createSkill);
router.delete('/:skillId', isAuth, deleteSkill);

module.exports = router;
