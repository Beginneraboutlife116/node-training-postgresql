const express = require('express');

const { dataSource } = require('../db/data-source');

const { isAuth, isAdmin } = require('../middlewares/auth');

const appError = require('../utils/app-error');
const { isNotValidString, isNotValidInteger, isNotValidUUID } = require('../utils/validators');
const handleErrorAsync = require('../utils/handle-error-async');

const router = express.Router();
const CreditPackageRepo = dataSource.getRepository('CreditPackage');
const CreditPurchaseRepo = dataSource.getRepository('CreditPurchase');

router.get(
  '/',
  handleErrorAsync(async (req, res, next) => {
    const creditPackages = await CreditPackageRepo.find({
      select: ['id', 'name', 'credit_amount', 'price'],
    });

    res.status(200).json({
      status: 'success',
      data: creditPackages,
    });
  })
);

router.post(
  '/',
  [isAuth, isAdmin],
  handleErrorAsync(async (req, res, next) => {
    const { name, credit_amount, price } = req.body;

    if (isNotValidString(name) || isNotValidInteger(credit_amount) || isNotValidInteger(price)) {
      return next(appError(400, '欄位未填寫正確'));
    }

    const isCreditPackageExist = await CreditPackageRepo.findOneBy({ name });

    if (isCreditPackageExist) {
      return next(appError(409, '資料重複'));
    }

    const newCreditPackage = CreditPackageRepo.create({
      name,
      credit_amount,
      price,
    });
    const result = await CreditPackageRepo.save(newCreditPackage);

    res.status(200).json({
      status: 'success',
      data: {
        id: result.id,
        name: result.name,
        credit_amount: result.credit_amount,
        price: result.price,
      },
    });
  })
);

router.post(
  '/:creditPackageId',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { id: userId } = req.user;
    const { creditPackageId } = req.params;

    if (isNotValidUUID(creditPackageId)) {
      return next(appError(400, 'ID錯誤'));
    }

    const foundCreditPackage = await CreditPackageRepo.findOneBy({
      id: creditPackageId,
    });

    if (!foundCreditPackage) {
      return next(appError(400, 'ID錯誤'));
    }

    const newCreditPurchase = CreditPurchaseRepo.create({
      user_id: userId,
      credit_package_id: creditPackageId,
      purchased_credits: foundCreditPackage.credit_amount,
      price_paid: foundCreditPackage.price,
    });

    await CreditPurchaseRepo.save(newCreditPurchase);

    res.status(201).json({
      status: 'success',
      data: null,
    });
  })
);

router.delete(
  '/:creditPackageId',
  [isAuth, isAdmin],
  handleErrorAsync(async (req, res, next) => {
    const { creditPackageId } = req.params;

    if (isNotValidUUID(creditPackageId)) {
      return next(appError(404, 'ID錯誤'));
    }

    const result = await CreditPackageRepo.delete(creditPackageId);

    if (result.affected === 0) {
      return next(appError(404, 'ID錯誤'));
    }

    res.status(200).json({
      status: 'success',
    });
  })
);

module.exports = router;
