const express = require('express');

const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { isNotValidString, isNotValidInteger, isNotValidUUID } = require('../utils/validators');
const handleErrorAsync = require('../utils/handle-error-async');

const router = express.Router();
const CoachRepo = dataSource.getRepository('Coach');

router.get(
  '/',
  handleErrorAsync(async (req, res, next) => {
    const { per, page } = req.query;

    if (
      isNotValidString(per) ||
      isNotValidString(page) ||
      isNotValidInteger(parseInt(per)) ||
      isNotValidInteger(parseInt(page))
    ) {
      return next(appError(400, '欄位未填寫正確'));
    }

    const numberPer = parseInt(per);
    const numberPage = parseInt(page);

    const coaches = await CoachRepo.createQueryBuilder('ch')
      .leftJoin('ch.user', 'u')
      .select(['ch.id as id', 'u.name as name'])
      .take(numberPer)
      .skip((numberPage - 1) * numberPer)
      .getRawMany();

    res.status(200).json({
      status: 'success',
      data: coaches,
    });
  })
);

router.get(
  '/:coachId',
  handleErrorAsync(async (req, res, next) => {
    const { coachId } = req.params;

    if (isNotValidUUID(coachId)) {
      return next(appError(400, '欄位未填寫正確'));
    }

    const coach = await CoachRepo.createQueryBuilder('ch')
      .innerJoin('ch.user', 'u')
      .where('ch.id = :coachId', { coachId })
      .select(['u.name as name', 'u.role as role', 'ch.*'])
      .getRawOne();

    if (!coach) {
      return next(appError(404, '找不到該教練'));
    }

    const { name, role, ...coachData } = coach;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          name,
          role,
        },
        coach: coachData,
      },
    });
  })
);

module.exports = router;
