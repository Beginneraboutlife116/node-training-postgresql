const { EntitySchema } = require('typeorm')

const { Role } = require('../lib/enums');

const { USER } = Role;

module.exports = new EntitySchema({
	name: 'User',
	tableName: 'USER',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
		},
		name: {
			type: 'varchar',
			length: 50,
		},
		email: {
			type: 'varchar',
			length: 320,
			unique: true
		},
		role: {
			type: 'varchar',
			length: 20,
			default: USER
		},
		password: {
			type: 'varchar',
			length: 72,
			select: false
		},
		created_at: {
			type: 'timestamp',
			createDate: true,
		},
		updated_at: {
			type: 'timestamp',
			updateDate: true,
		}
	}
})
