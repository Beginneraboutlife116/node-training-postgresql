const bcrypt = require('bcrypt');
const { matches } = require('validator');

const config = require('../config/index');

const { dataSource } = require('../db/data-source');

const appError = require('../utils/app-error');
const { isNotValidString, isNotValidEmail, isNotValidPassword } = require('../utils/validators');
const { generateToken } = require('../utils/jwt');
const handleErrorAsync = require('../utils/handle-error-async');

const UserRepo = dataSource.getRepository('User');

const signup = handleErrorAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  if (isNotValidString(name) || isNotValidEmail(email)) {
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

  if (isNotValidEmail(email)) {
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
})

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
})

module.exports = {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
};
