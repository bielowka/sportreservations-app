'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      objectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sport_objects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notEmpty: true,
          isDate: true
        }
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notEmpty: true,
          isDate: true
        }
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending',
        allowNull: false,
        validate: {
          isIn: [['pending', 'confirmed', 'cancelled', 'completed']]
        }
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelledBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      cancellationReason: {
        type: Sequelize.STRING(500),
        allowNull: true
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
    await queryInterface.addIndex('reservations', ['userId'], {
      name: 'reservations_user_id_idx'
    });
    
    await queryInterface.addIndex('reservations', ['objectId'], {
      name: 'reservations_object_id_idx'
    });
    
    await queryInterface.addIndex('reservations', ['startTime'], {
      name: 'reservations_start_time_idx'
    });
    
    await queryInterface.addIndex('reservations', ['endTime'], {
      name: 'reservations_end_time_idx'
    });
    
    await queryInterface.addIndex('reservations', ['status'], {
      name: 'reservations_status_idx'
    });

    await queryInterface.addIndex('reservations', ['objectId', 'startTime', 'endTime'], {
      name: 'reservations_object_time_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reservations');
  }
};
