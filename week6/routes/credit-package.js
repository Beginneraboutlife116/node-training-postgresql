const express = require('express')
const { body, param, validationResult } = require('express-validator');

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('CreditPackage');
const appError = require('../utils/app-error');

const router = express.Router();
const CreditPackageRepo = dataSource.getRepository('CreditPackage')

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

router.post('/',
	body('name').isString().trim().notEmpty(),
	body('credit_amount').notEmpty().isInt({ gt: 0 }),
	body('price').notEmpty().isInt({ gt: 0 }),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return next(appError(400, '欄位未填寫正確'));
		}

		try {
			const { name, credit_amount, price } = req.body;

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
	}
);


router.delete('/:creditPackageId', [
	param('creditPackageId').isUUID().withMessage('ID錯誤')
], async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(appError(400, errors.array()[0].msg));
	}

	try {
		const { creditPackageId } = req.params;

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
