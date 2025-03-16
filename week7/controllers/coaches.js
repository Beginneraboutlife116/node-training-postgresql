const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { isNotValidString, isNotValidInteger, isNotValidUUID } = require('../utils/validators');
const handleErrorAsync = require('../utils/handle-error-async');

const CoachRepo = dataSource.getRepository('Coach');
const CourseRepo = dataSource.getRepository('Course');

const getCoaches = handleErrorAsync(async (req, res, next) => {
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
});

const getCoach = handleErrorAsync(async (req, res, next) => {
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
});

const getCoachCourses = handleErrorAsync(async (req, res, next) => {
  const { coachId } = req.params;

  if (isNotValidUUID(coachId)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  const foundCoach = await CoachRepo.findOneBy({ user_id: coachId });

  if (!foundCoach) {
    return next(appError(404, '找不到該教練'));
  }

  const foundCourses = await CourseRepo.createQueryBuilder('ce')
    .innerJoin('ce.user', 'u')
    .innerJoin('ce.skill', 's')
    .where('u.id = :coachId', { coachId })
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
    data: foundCourses,
  });
});

module.exports = {
  getCoaches,
  getCoach,
  getCoachCourses,
};
