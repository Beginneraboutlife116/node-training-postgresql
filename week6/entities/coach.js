const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Coach',
  tableName: 'COACH',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    user_id: {
      type: 'uuid',
      unique: true,
    },
    experience_years: {
      type: 'integer',
    },
    description: {
      type: 'text',
    },
    profile_image_url: {
      type: 'varchar',
      length: 2048,
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'one-to-one',
      inverseSide: 'Coach',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'coach_user_id_fk',
      },
    },
  },
});
