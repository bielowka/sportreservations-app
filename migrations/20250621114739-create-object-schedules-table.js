'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('object_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      dayOfWeek: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0 = niedziela, 1 = poniedziałek, ..., 6 = sobota'
      },
      isOpen: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      openingTime: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'null jeśli isOpen = false'
      },
      closingTime: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'null jeśli isOpen = false'
      },
      breakStartTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      breakEndTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      specialNotes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('object_schedules', ['objectId'], {
      name: 'object_schedules_object_id_idx'
    });
    
    await queryInterface.addIndex('object_schedules', ['dayOfWeek'], {
      name: 'object_schedules_day_of_week_idx'
    });
    
    // Unikalny indeks na objectId + dayOfWeek
    await queryInterface.addIndex('object_schedules', ['objectId', 'dayOfWeek'], {
      unique: true,
      name: 'object_schedules_object_day_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('object_schedules');
  }
};
