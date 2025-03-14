const { EntitySchema } = require('typeorm')

const { USER_ROLE } = require('../lib/enums');

const { USER } = USER_ROLE

module.exports = new EntitySchema({
	name: 'User',
	tableName: 'USER',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
			nullable: false
		},
		name: {
			type: 'varchar',
			length: 50,
			nullable: false
		},
		email: {
			type: 'varchar',
			length: 320,
			nullable: false,
			unique: true
		},
		role: {
			type: 'varchar',
			length: 20,
			nullable: false,
			default: USER
		},
		password: {
			type: 'varchar',
			length: 72,
			nullable: false,
			select: false
		},
		created_at: {
			type: 'timestamp',
			createDate: true,
			nullable: false
		},
		updated_at: {
			type: 'timestamp',
			updateDate: true,
			nullable: false
		}
	}
})
