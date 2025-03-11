const { EntitySchema } = require('typeorm');

const { BookingStatus } = require('../lib/enums');

const { BOOKED } = BookingStatus;

module.exports = new EntitySchema({
	name: 'CourseBooking',
	tableName: 'COURSE_BOOKING',
	columns: {
		id: {
			primary: true,
			type: 'uuid',
			generated: 'uuid',
		},
		user_id: {
			type: 'uuid',
		},
		course_id: {
			type: 'uuid',
		},
		booking_at: {
			type: 'timestamp',
			createDate: true,
		},
		status: {
			type: 'varchar',
			length: 20,
			default: BOOKED,
		},
		join_at: {
			type: 'timestamp',
			nullable: true,
		},
		leave_at: {
			type: 'timestamp',
			nullable: true,
		},
		cancelled_at: {
			type: 'timestamp',
			nullable: true,
		},
		cancellation_reason: {
			type: 'varchar',
			length: 255,
			nullable: true,
		},
		created_at: {
			type: 'timestamp',
			createDate: true,
		},
	},
	relation: {
		user: {
			target: 'User',
			type: 'many-to-one',
			joinColumn: {
				name: 'user_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'course_booking_user_id_fk',
			}
		},
		course: {
			target: 'Course',
			type: 'many-to-one',
			joinColumn: {
				name: 'course_id',
				referencedColumnName: 'id',
				foreignKeyConstraintName: 'course_booking_course_id_fk',
			}
		}
	},
});
;
