'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sport_objects', 'ownerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Set initial owner (admin user)
    const [adminUsers] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );
    if (adminUsers.length > 0) {
      await queryInterface.sequelize.query(
        'UPDATE sport_objects SET ownerId = :adminId WHERE id = 1',
        {
          replacements: { adminId: adminUsers[0].id }
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // First remove the foreign key constraint
    await queryInterface.sequelize.query(
      'ALTER TABLE sport_objects DROP FOREIGN KEY sport_objects_ibfk_1'
    );
    
    // Then remove the index
    await queryInterface.sequelize.query(
      'DROP INDEX sport_objects_owner_id ON sport_objects'
    );
    
    // Finally remove the column
    await queryInterface.removeColumn('sport_objects', 'ownerId');
  }
}; 