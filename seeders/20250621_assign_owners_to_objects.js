'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the admin user ID
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@sportreservations.com'"
    );

    if (adminUser.length > 0) {
      // Update all sport objects to have the admin user as owner
      await queryInterface.sequelize.query(
        'UPDATE sport_objects SET ownerId = :adminId',
        {
          replacements: { adminId: adminUser[0].id }
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove owner from all objects
    await queryInterface.sequelize.query(
      'UPDATE sport_objects SET ownerId = NULL'
    );
  }
}; 