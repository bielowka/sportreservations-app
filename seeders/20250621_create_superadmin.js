'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    await queryInterface.bulkInsert('users', [{
      name: 'Super Administrator',
      email: 'superadmin@sportreservations.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: 'superadmin@sportreservations.com'
    }, {});
  }
}; 