const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
	name: 'CreditPurchase',
	tableName: 'CREDIT_PURCHASE',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
		},
		user_id: {
			type: 'uuid',
		},
		credit_package_id: {
			type: 'uuid',
		},
		purchased_credits: {
			type: 'integer',
		},
		price_paid: {
			type: 'numeric',
			precision: 10,
			scale: 2,
		},
		create_at: {
			type: 'timestamp',
			createDate: true,
		},
		purchase_at: {
			type: 'timestamp',
			createDate: true,
		}
	},
	relations: {
		user: {
			target: 'User',
			type: 'many-to-one',
			joinColumn: {
				name: 'user_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'credit_purchase_user_id_fk',
			}
		},
		creditPackage: {
			target: 'CreditPackage',
			type: 'many-to-one',
			joinColumn: {
				name: 'credit_package_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'credit_purchase_credit_package_id_fk',
			}
		}
	}
});
