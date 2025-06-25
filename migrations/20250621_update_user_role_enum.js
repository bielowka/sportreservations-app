'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add 'client' and 'superadmin' to ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('user', 'client', 'admin', 'superadmin') NOT NULL DEFAULT 'user'`,
      { type: Sequelize.QueryTypes.RAW }
    );
    // 2. Replace 'user' with 'client'
    await queryInterface.sequelize.query(
      `UPDATE users SET role = 'client' WHERE role = 'user'`,
      { type: Sequelize.QueryTypes.UPDATE }
    );
    // 3. Remove 'user' from ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('client', 'admin', 'superadmin') NOT NULL DEFAULT 'client'`,
      { type: Sequelize.QueryTypes.RAW }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Add 'user' back to ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('user', 'client', 'admin', 'superadmin') NOT NULL DEFAULT 'client'`,
      { type: Sequelize.QueryTypes.RAW }
    );
    // 2. Replace 'client' with 'user'
    await queryInterface.sequelize.query(
      `UPDATE users SET role = 'user' WHERE role = 'client'`,
      { type: Sequelize.QueryTypes.UPDATE }
    );
    // 3. Remove 'client' and 'superadmin' from ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'`,
      { type: Sequelize.QueryTypes.RAW }
    );
  }
}; 