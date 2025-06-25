'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sport_objects', 'minReservationDuration', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Minimalna długość rezerwacji w minutach'
    });

    await queryInterface.addColumn('sport_objects', 'timeSlotDuration', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Długość slotu czasowego w minutach'
    });

    await queryInterface.addColumn('sport_objects', 'advanceBookingDays', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Liczba dni w przód na które można rezerwować'
    });

    await queryInterface.addColumn('sport_objects', 'cancellationHours', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 24,
      comment: 'Liczba godzin przed rezerwacją na anulowanie'
    });

    await queryInterface.addColumn('sport_objects', 'useCustomSchedule', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Czy używać niestandardowego harmonogramu tygodniowego'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sport_objects', 'minReservationDuration');
    await queryInterface.removeColumn('sport_objects', 'timeSlotDuration');
    await queryInterface.removeColumn('sport_objects', 'advanceBookingDays');
    await queryInterface.removeColumn('sport_objects', 'cancellationHours');
    await queryInterface.removeColumn('sport_objects', 'useCustomSchedule');
  }
};
