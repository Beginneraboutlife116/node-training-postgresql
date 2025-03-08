const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
	name: 'Course',
	tableName: 'COURSE',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
			nullable: false
		},
		user_id: {
			type: 'uuid',
			nullable: false,
			unique: true
		},
		skill_id: {
			type: 'uuid',
			nullable: false
		},
		name: {
			type: 'varchar',
			length: 100,
			nullable: false,
		},
		description: {
			type: 'text',
			nullable: false
		},
		start_at: {
			type: 'timestamp',
			nullable: false	
		},
		end_at: {
			type: 'timestamp',
			nullable: false
		},
		max_participants: {
			type: 'integer',
			nullable: false
		},
		meeting_url: {
			type: 'varchar',
			length: 2048,
			nullable: false,
			unique: true
		},
		created_at: {
			type: 'timestamp',
			createDate: true,
			nullable: false
		},
		update_at: {
			type: 'timestamp',
			updateDate: true,
			nullable: false
		}
	},
	relations: {
		user: {
			target: 'User',
			type: 'many-to-one',
			inverseSide: 'Course',
			joinColumn: {
				name: 'user_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'course_user_id_fk',
			},
		},
		skill: {
			target: 'Skill',
			type: 'many-to-one',
			inverseSide: 'Course',
			joinColumn: {
				name: 'skill_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'course_skill_id_fk'
			},
		}
	}
})
