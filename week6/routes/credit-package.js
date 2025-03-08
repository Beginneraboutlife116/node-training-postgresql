const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')

const {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID,
} = require('../utils/validators');
const errorHandler = require('../utils/error-handler');

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

router.post('/', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { name, credit_amount, price } = req.body;

		if (isNotValidString(name) || isNotValidInteger(credit_amount) || isNotValidInteger(price)) {
			res.status(400).json({
				status: 'failed',
				message: '欄位未填寫正確',
			});
			return;
		}

		const isCreditPackageExist = await CreditPackageRepo.findOne({
			where: { name },
		});

		if (isCreditPackageExist) {
			wrappedErrorHandler(409, '資料重複');
			return;
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
})

router.delete('/:creditPackageId', async (req, res, next) => {
	const wrappedErrorHandler = (statusCode, message) => errorHandler(res, statusCode, message);

	try {
		const { creditPackageId } = req.params;

		if (isNotValidUUID(creditPackageId)) {
			wrappedErrorHandler(400, 'ID錯誤');
			return;
		}

		const result = await CreditPackageRepo.delete(creditPackageId);

		if (result.affected === 0) {
			wrappedErrorHandler(400, 'ID錯誤');
			return;
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
