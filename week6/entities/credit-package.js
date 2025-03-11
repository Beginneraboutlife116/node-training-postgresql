const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CreditPackage',
  tableName: 'CREDIT_PACKAGE',
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
    credit_amount: {
      type: 'integer',
    },
    price: {
      type: 'numeric',
      precision: 10,
      scale: 2,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});
