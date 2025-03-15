const express = require('express');

const { creditPackageController } = require('../controllers/index');

const { isAuth, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const { getCreditPackages, createCreditPackage, deleteCreditPackage, updateUserPurchaseCreditPackage } =
  creditPackageController;

router.get('/', getCreditPackages);
router.post('/', [isAuth, isAdmin], createCreditPackage);
router.post('/:creditPackageId', isAuth, updateUserPurchaseCreditPackage);
router.delete('/:creditPackageId', [isAuth, isAdmin], deleteCreditPackage);

module.exports = router;
