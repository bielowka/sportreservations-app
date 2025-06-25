'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sport_objects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 255]
        }
      },
      location: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [5, 500]
        }
      },
      openingTime: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      closingTime: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      objectType: {
        type: Sequelize.ENUM('football', 'tennis', 'basketball', 'volleyball', 'swimming', 'gym', 'other'),
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [['football', 'tennis', 'basketball', 'volleyball', 'swimming', 'gym', 'other']]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      pricePerHour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      maxCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      facilities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Dodanie indeksów
    await queryInterface.addIndex('sport_objects', ['objectType'], {
      name: 'sport_objects_object_type_idx'
    });
    
    await queryInterface.addIndex('sport_objects', ['isActive'], {
      name: 'sport_objects_is_active_idx'
    });
    
    await queryInterface.addIndex('sport_objects', ['location'], {
      name: 'sport_objects_location_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sport_objects');
  }
};
