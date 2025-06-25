'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const objects = await queryInterface.sequelize.query(
        'SELECT id, name FROM sport_objects WHERE name IN (:names)',
        {
          replacements: {
            names: [
              'Boisko Orlik',
              'Kort tenisowy Centralny',
              'Basen Olimpijski',
              'Siłownia Fitness Pro'
            ]
          },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      const objectMap = objects.reduce((acc, obj) => {
        acc[obj.name] = obj.id;
        return acc;
      }, {});

      await queryInterface.bulkUpdate(
        'sport_objects',
        { useCustomSchedule: true },
        { id: objects.map(obj => obj.id) },
        { transaction: t }
      );

      const schedules = [];

      if (objectMap['Boisko Orlik']) {
        for (let day = 0; day <= 6; day++) {
          schedules.push({
            objectId: objectMap['Boisko Orlik'],
            dayOfWeek: day,
            isOpen: true,
            openingTime: day === 0 ? '09:00:00' : day === 6 ? '08:00:00' : '06:00:00',
            closingTime: day === 0 ? '20:00:00' : day === 6 ? '23:00:00' : '22:00:00',
            specialNotes: day === 0 ? 'Niedziela - krótsze godziny' :
                         day === 6 ? 'Weekend - dłuższe godziny' : 'Standardowe godziny',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (objectMap['Kort tenisowy Centralny']) {
        for (let day = 0; day <= 6; day++) {
          schedules.push({
            objectId: objectMap['Kort tenisowy Centralny'],
            dayOfWeek: day,
            isOpen: day !== 0, // Closed on Sunday
            openingTime: day === 6 ? '09:00:00' : '08:00:00',
            closingTime: day === 6 ? '18:00:00' : '20:00:00',
            breakStartTime: day <= 5 ? '12:00:00' : null,
            breakEndTime: day <= 5 ? '13:00:00' : null,
            specialNotes: day === 0 ? 'Niedziela - zamknięte' :
                         day === 6 ? 'Weekend - bez przerwy' : 'Przerwa na lunch 12:00-13:00',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (objectMap['Basen Olimpijski']) {
        const daysOfWeek = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        for (let day = 0; day <= 6; day++) {
          schedules.push({
            objectId: objectMap['Basen Olimpijski'],
            dayOfWeek: day,
            isOpen: true,
            openingTime: '06:00:00',
            closingTime: '23:00:00',
            specialNotes: daysOfWeek[day],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (objectMap['Siłownia Fitness Pro']) {
        const daysOfWeek = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        for (let day = 0; day <= 6; day++) {
          schedules.push({
            objectId: objectMap['Siłownia Fitness Pro'],
            dayOfWeek: day,
            isOpen: true,
            openingTime: '05:00:00',
            closingTime: '24:00:00',
            specialNotes: `${daysOfWeek[day]} - 24h`,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      await queryInterface.bulkInsert('object_schedules', schedules, { transaction: t });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('object_schedules', null, {});
    await queryInterface.bulkUpdate(
      'sport_objects',
      { useCustomSchedule: false },
      { useCustomSchedule: true }
    );
  }
};
