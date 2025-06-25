const { Sequelize } = require('sequelize');
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging ? console.log : false,
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączenie z bazą danych MySQL zostało ustanowione pomyślnie.');
  } catch (error) {
    console.error('Nie można połączyć się z bazą danych MySQL:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 