const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const {
  isNotValidString,
  isNotValidInteger,
  isNotValidUUID,
  isNotValidImageURL,
  isNotValidDate,
  isNotValidURL,
  isNotValidTimeStartAndEnd,
} = require('../utils/validators');
const handleErrorAsync = require('../utils/handle-error-async');

const { Role } = require('../lib/enums');

const UserRepo = dataSource.getRepository('User');
const CoachRepo = dataSource.getRepository('Coach');
const SkillRepo = dataSource.getRepository('Skill');
const CourseRepo = dataSource.getRepository('Course');

const { COACH, ADMIN } = Role;

const createCourseByCoach = handleErrorAsync(async (req, res, next) => {
  const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body;

  if (
    isNotValidUUID(user_id) ||
    isNotValidUUID(skill_id) ||
    isNotValidString(name) ||
    isNotValidString(description) ||
    isNotValidInteger(max_participants) ||
    isNotValidURL(meeting_url) ||
    isNotValidDate(start_at) ||
    isNotValidDate(end_at) ||
    isNotValidTimeStartAndEnd(start_at, end_at)
  ) {
    return next(appError(400, '欄位未填寫正確'));
  }

  const foundUser = await UserRepo.findOneBy({ id: user_id });
  const foundSkill = await SkillRepo.findOneBy({ id: skill_id });

  if (!foundUser) {
    return next(appError(400, '使用者不存在'));
  }

  if (!foundSkill) {
    return next(appError(400, '教練專長不存在'));
  }

  if (foundUser.role !== COACH) {
    return next(appError(400, '使用者尚未成為教練'));
  }

  const newCourse = CourseRepo.create({
    user_id,
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  });
  const result = await CourseRepo.save(newCourse);

  res.status(201).json({
    status: 'success',
    data: result,
  });
})

const updateCourseByCoach =  handleErrorAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body;

  if (
    isNotValidUUID(skill_id) ||
    isNotValidString(name) ||
    isNotValidString(description) ||
    isNotValidInteger(max_participants) ||
    isNotValidURL(meeting_url) ||
    isNotValidDate(start_at) ||
    isNotValidDate(end_at) ||
    isNotValidTimeStartAndEnd(start_at, end_at)
  ) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (isNotValidUUID(courseId)) {
    return next(appError(400, '課程不存在'));
  }

  const foundCourse = await CourseRepo.findOneBy({ id: courseId });
  const foundSkill = await SkillRepo.findOneBy({ id: skill_id });

  if (!foundCourse) {
    return next(appError(400, '課程不存在'));
  }

  if (!foundSkill) {
    return next(appError(400, '教練專長不存在'));
  }

  const result = await CourseRepo.update(
    {
      id: courseId,
    },
    {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    }
  );

  if (result.affected === 0) {
    return next(appError(400, '更新課程失敗'));
  }

  const updatedCourse = await CourseRepo.findOneBy({ id: courseId });

  res.status(200).json({
    status: 'success',
    data: updatedCourse,
  });
})

const updateUserAsCoach = handleErrorAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { experience_years, description, profile_image_url } = req.body;

  if (isNotValidInteger(experience_years) || isNotValidString(description)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (profile_image_url !== '' && isNotValidImageURL(profile_image_url)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (isNotValidUUID(userId)) {
    return next(appError(400, '使用者不存在'));
  }

  const foundUser = await UserRepo.findOneBy({ id: userId });

  if (!foundUser) {
    return next(appError(400, '使用者不存在'));
  }

  if (foundUser.role === COACH) {
    return next(appError(409, '使用者已經是教練'));
  }

  const updateUserResult = await UserRepo.update(
    {
      id: userId,
    },
    { role: COACH }
  );

  if (updateUserResult.affected === 0) {
    return next(appError(400, '更新使用者失敗'));
  }

  const newCoach = CoachRepo.create({
    user_id: userId,
    experience_years,
    description,
    profile_image_url,
  });
  const coachResult = await CoachRepo.save(newCoach);
  const { name, role } = await UserRepo.findOneBy({ id: userId });

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

const updateUserAsAdmin = handleErrorAsync(async (req, res, next) => {
  const { userId } = req.params;

  const foundAdmin = await UserRepo.findBy({ role: ADMIN });

  if (foundAdmin.length > 0) {
    return next(appError(409, '管理員已經存在'));
  }

  if (isNotValidUUID(userId)) {
    return next(appError(400, '使用者不存在'));
  }

  const foundUser = await UserRepo.findOneBy({ id: userId });

  if (!foundUser) {
    return next(appError(400, '使用者不存在'));
  }

  if (foundUser.role === ADMIN) {
    return next(appError(409, '使用者已經是管理員'));
  }

  const updateUserResult = await UserRepo.update({ id: userId }, { role: ADMIN });

  if (updateUserResult.affected === 0) {
    return next(appError(400, '更新使用者失敗'));
  }

  const { name, role } = await UserRepo.findOneBy({ id: userId });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        name,
        role,
      },
    }
  })
})

module.exports = {
  createCourseByCoach,
  updateCourseByCoach,
  updateUserAsCoach,
  updateUserAsAdmin,
};
