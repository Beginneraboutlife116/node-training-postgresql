const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
	name: 'Course',
	tableName: 'COURSE',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
		},
		user_id: {
			type: 'uuid',
			unique: true
		},
		skill_id: {
			type: 'uuid',
		},
		name: {
			type: 'varchar',
			length: 100,
		},
		description: {
			type: 'text',
		},
		start_at: {
			type: 'timestamp',
		},
		end_at: {
			type: 'timestamp',
		},
		max_participants: {
			type: 'integer',
		},
		meeting_url: {
			type: 'varchar',
			length: 2048,
			unique: true
		},
		created_at: {
			type: 'timestamp',
			createDate: true,
		},
		update_at: {
			type: 'timestamp',
			updateDate: true,
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
