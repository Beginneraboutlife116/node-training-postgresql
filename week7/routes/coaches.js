const express = require('express');

const { coachesController } = require('../controllers/index');

const router = express.Router();
const { getCoaches, getCoach } = coachesController;

router.get('/', getCoaches);
router.get('/:coachId', getCoach);

module.exports = router;
