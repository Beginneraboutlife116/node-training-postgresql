const express = require('express')

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('CreditPackage');
const appError = require('../utils/app-error');
const {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID,
} = require('../utils/validators');

const router = express.Router();
const CreditPackageRepo = dataSource.getRepository('CreditPackage');

router.get('/', async (req, res, next) => {
	try {
		const creditPackages = await CreditPackageRepo.find({
			select: ['id', 'name', 'credit_amount', 'price'],
		});

		res.status(200).json({
			status: 'success',
			data: creditPackages,
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
})

router.post('/', async (req, res, next) => {
	const {
		name,
		credit_amount,
		price,
	} = req.body;

	if (isNotValidString(name) ||
		isNotValidInteger(credit_amount) ||
		isNotValidInteger(price)) {
		return next(appError(400, '欄位未填寫正確'));
	}

	try {
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
	} catch (error) {
		logger.error(error);
		next(error);
	}
});


router.delete('/:creditPackageId', async (req, res, next) => {
	const { creditPackageId } = req.params;

	if (isNotValidUUID(creditPackageId)) {
		return next(appError(404, 'ID錯誤'));
	}

	try {
		const result = await CreditPackageRepo.delete(creditPackageId);

		if (result.affected === 0) {
			return next(appError(404, 'ID錯誤'));
		}

		res.status(200).json({
			status: 'success',
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
})

module.exports = router
