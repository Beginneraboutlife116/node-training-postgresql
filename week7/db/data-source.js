const { DataSource } = require('typeorm');

const config = require('../config/index');

const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: ['entities/*.js'],
  ssl: config.get('db.ssl'),
});

module.exports = { dataSource };
