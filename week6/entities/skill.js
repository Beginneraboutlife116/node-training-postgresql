const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Skill',
  tableName: 'SKILL',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 50,
      unique: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
    },
  },
});
