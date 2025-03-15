const bcrypt = require('bcrypt');
const { matches } = require('validator');

const config = require('../config/index');

const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { isNotValidString, isNotValidEmail, isNotValidPassword } = require('../utils/validators');
const { generateToken } = require('../utils/jwt');
const handleErrorAsync = require('../utils/handle-error-async');

const { BookingStatus } = require('../lib/enums');

const UserRepo = dataSource.getRepository('User');
const CreditPurchaseRepo = dataSource.getRepository('CreditPurchase');
const CourseBookingRepo = dataSource.getRepository('CourseBooking');
const { COMPLETED } = BookingStatus;

const signup = handleErrorAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  if (isNotValidString(name) || isNotValidEmail(email) || isNotValidString(password)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (isNotValidPassword(password)) {
    return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
  }

  const isEmailExist = await UserRepo.findOneBy({ email });

  if (isEmailExist) {
    return next(appError(409, 'Email已被使用'));
  }

  const hashPassword = await bcrypt.hash(password, config.get('secret.saltRounds'));
  const newUser = UserRepo.create({
    name,
    email,
    password: hashPassword,
  });

  const result = await UserRepo.save(newUser);

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: result.id,
        name: result.name,
      },
    },
  });
});

const login = handleErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (isNotValidEmail(email) || isNotValidString(password)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (isNotValidPassword(password)) {
    return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
  }

  const foundUser = await UserRepo.findOne({
    select: ['id', 'name', 'role', 'password'],
    where: { email },
  });

  if (!foundUser) {
    return next(appError(400, '使用者不存在或密碼輸入錯誤'));
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    return next(appError(400, '使用者不存在或密碼輸入錯誤'));
  }

  const token = generateToken({
    id: foundUser.id,
    role: foundUser.role,
  });

  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        name: foundUser.name,
      },
    },
  });
});

const getUserProfile = handleErrorAsync(async (req, res, next) => {
  const { id } = req.user;
  const foundUser = await UserRepo.findOne({
    where: { id },
    select: ['email', 'name'],
  });

  if (!foundUser) {
    return next(appError(400, '使用者不存在'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        email: foundUser.email,
        name: foundUser.name,
      },
    },
  });
});

const updateUserProfile = handleErrorAsync(async (req, res, next) => {
  const { id } = req.user;
  const { name } = req.body;

  if (isNotValidString(name) || !matches(name, /^[\w\u4e00-\u9fa5]{2,10}$/)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  const updatedUser = await UserRepo.update({ id }, { name });

  if (updatedUser.affected === 0) {
    return next(appError(400, '更新使用者失敗'));
  }

  res.status(200).json({
    status: 'success',
  });
});

const updateUserPassword = handleErrorAsync(async (req, res, next) => {
  const { id } = req.user;
  const { password, new_password, confirm_new_password } = req.body;

  if (isNotValidString(password) || isNotValidString(new_password) || isNotValidString(confirm_new_password)) {
    return next(appError(400, '欄位未填寫正確'));
  }

  if (password === new_password) {
    return next(appError(400, '新密碼不能與舊密碼相同'));
  }

  if (new_password !== confirm_new_password) {
    return next(appError(400, '新密碼與驗證新密碼不一致'));
  }

  if (isNotValidPassword(new_password)) {
    return next(appError(400, '新密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'));
  }

  const foundUser = await UserRepo.findOne({
    where: { id },
    select: ['password'],
  });

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    return next(appError(400, '密碼輸入錯誤'));
  }

  const hashPassword = await bcrypt.hash(new_password, config.get('secret.saltRounds'));
  const updateUser = await UserRepo.update({ id }, { password: hashPassword });

  if (updateUser.affected === 0) {
    return next(appError(400, '更新密碼失敗'));
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

const getUserPurchasedCreditPackages = handleErrorAsync(async (req, res) => {
  const { id } = req.user;

  const userPurchasedCreditPackages = await CreditPurchaseRepo.createQueryBuilder('cps')
    .innerJoin('cps.creditPackage', 'cpk')
    .select([
      'cps.purchased_credits as purchased_credits',
      'cps.price_paid as price_paid',
      'cps.purchase_at as purchase_at',
      'cpk.name as name',
    ])
    .where('cps.user_id = :id', { id })
    .getRawMany();

  res.status(200).json({
    status: 'success',
    data: userPurchasedCreditPackages,
  });
});

const getUserBookCourses = handleErrorAsync(async (req, res) => {
  const { id } = req.user;

  const userTotalCredits = await CreditPurchaseRepo.sum('purchased_credits', {
    user_id: id,
  });
  const usedCredits = await CourseBookingRepo.count({
    where: { user_id: id, status: COMPLETED },
  });

  const userBookedCourses = await CourseBookingRepo.createQueryBuilder('cb')
    .innerJoin('cb.course', 'c')
    .innerJoin('cb.user', 'u')
    .select([
      'c.name as name',
      'u.name as coach_name',
      'cb.status as status',
      'c.start_at as start_at',
      'c.end_at as end_at',
      'c.meeting_url as meeting_url',
    ])
    .where('cb.user_id = :id', { id })
    .getRawMany();

  res.status(200).json({
    status: 'success',
    data: {
      credit_remain: userTotalCredits - usedCredits,
      credit_usage: usedCredits,
      course_booking: userBookedCourses,
    },
  });
});

module.exports = {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserPurchasedCreditPackages,
  getUserBookCourses,
};
