'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@sportreservations.com'"
    );

    if (adminUser.length > 0) {
      await queryInterface.sequelize.query(
        'UPDATE sport_objects SET ownerId = :adminId',
        {
          replacements: { adminId: adminUser[0].id }
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'UPDATE sport_objects SET ownerId = NULL'
    );
  }
}; 