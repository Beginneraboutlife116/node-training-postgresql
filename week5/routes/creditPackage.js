const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')

const {
	isNotValidString,
	isNotValidInteger,
	isNotValidUUID,
} = require('../utils/validators');

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
	try {
		const { name, credit_amount, price } = req.body;

		if (isNotValidString(name) || isNotValidInteger(credit_amount) || isNotValidInteger(price)) {
			res.status(400).json({
				status: 'failed',
				message: '欄位未填寫正確',
			});
			return;
		}

		const foundCreditPackages = await CreditPackageRepo.find({
			where: { name },
		});

		if (foundCreditPackages.length > 0) {
			res.status(409).json({
				status: 'failed',
				message: '資料重複',
			});
			return;
		}

		const newCreditPackage = await CreditPackageRepo.create({
			name,
			credit_amount,
			price,
		});
		const { id } = await CreditPackageRepo.save(newCreditPackage);

		res.status(200).json({
			status: 'success',
			data: {
				id,
				name,
				credit_amount,
				price,
			},
		});
	} catch (error) {
		logger.error(error);
		next(error);
	}
})

router.delete('/:creditPackageId', async (req, res, next) => {
	try {
		const { creditPackageId } = req.params;

		if (isNotValidUUID(creditPackageId)) {
			res.status(400).json({
				status: 'failed',
				message: 'ID錯誤',
			});
			return;
		}

		const result = await CreditPackageRepo.delete(creditPackageId);

		if (result.affected === 0) {
			res.status(400).json({
				status: 'failed',
				message: 'ID錯誤',
			});
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
