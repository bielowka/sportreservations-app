'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    return queryInterface.sequelize.transaction(async (t) => {
      const users = await queryInterface.bulkInsert('users', [
        {
          name: 'Jan Kowalski',
          email: 'jan.kowalski@example.com',
          password: hashedPassword,
          role: 'client',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Anna Nowak',
          email: 'anna.nowak@example.com',
          password: hashedPassword,
          role: 'client',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Admin System',
          email: 'admin@sportreservations.com',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction: t, returning: true });

      const objects = await queryInterface.bulkInsert('sport_objects', [
        {
          name: 'Boisko Orlik',
          location: 'Warszawa, ul. Sportowa 1',
          openingTime: '06:00:00',
          closingTime: '22:00:00',
          objectType: 'football',
          description: 'Sztuczna nawierzchnia, oświetlenie, szatnie, parking',
          isActive: true,
          pricePerHour: 50,
          maxCapacity: 22,
          facilities: JSON.stringify({
            lighting: true,
            changingRooms: true,
            parking: true,
            equipment: ['piłki', 'bramki']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Kort tenisowy Centralny',
          location: 'Kraków, ul. Tenisowa 5',
          openingTime: '08:00:00',
          closingTime: '20:00:00',
          objectType: 'tennis',
          description: 'Nawierzchnia ceglana, profesjonalne oświetlenie, trybuny',
          isActive: true,
          pricePerHour: 80,
          maxCapacity: 4,
          facilities: JSON.stringify({
            lighting: true,
            changingRooms: true,
            equipment: ['rakiety', 'piłki'],
            surface: 'ceglana'
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Basen Olimpijski',
          location: 'Gdańsk, ul. Basenowa 10',
          openingTime: '06:00:00',
          closingTime: '23:00:00',
          objectType: 'swimming',
          description: '50m basen, sauna, jacuzzi, siłownia, kawiarnia',
          isActive: true,
          pricePerHour: 30.00,
          maxCapacity: 100,
          facilities: JSON.stringify({
            sauna: true,
            jacuzzi: true,
            gym: true,
            cafe: true,
            equipment: ['ręczniki', 'szafki']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Boisko do koszykówki',
          location: 'Wrocław, ul. Koszykowa 15',
          openingTime: '07:00:00',
          closingTime: '21:00:00',
          objectType: 'basketball',
          description: 'Kryte boisko, parkiet, oświetlenie',
          isActive: true,
          pricePerHour: 60.00,
          maxCapacity: 10,
          facilities: JSON.stringify({
            indoor: true,
            lighting: true,
            changingRooms: true,
            equipment: ['kosze', 'piłki']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Siłownia Fitness Pro',
          location: 'Poznań, ul. Siłowa 8',
          openingTime: '05:00:00',
          closingTime: '24:00:00',
          objectType: 'gym',
          description: 'Nowoczesna siłownia z pełnym wyposażeniem',
          isActive: true,
          pricePerHour: 25.00,
          maxCapacity: 50,
          facilities: JSON.stringify({
            cardio: true,
            strength: true,
            classes: true,
            personalTrainer: true,
            equipment: ['sprzęt cardio', 'wolne ciężary', 'maszyny']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction: t, returning: true });

      const [user1Id, user2Id] = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email IN (:emails) ORDER BY email',
        {
          replacements: { emails: ['jan.kowalski@example.com', 'anna.nowak@example.com'] },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      const [object1Id, object2Id] = await queryInterface.sequelize.query(
        'SELECT id FROM sport_objects WHERE name IN (:names) ORDER BY name',
        {
          replacements: { names: ['Boisko Orlik', 'Kort tenisowy Centralny'] },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      await queryInterface.bulkInsert('reservations', [
        {
          userId: user1Id.id,
          objectId: object1Id.id,
          startTime: new Date('2025-06-23T08:00:00'),
          endTime: new Date('2025-06-23T10:00:00'),
          status: 'confirmed',
          totalPrice: 100,
          notes: 'Gra w piłkę z kolegami',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: user2Id.id,
          objectId: object2Id.id,
          startTime: new Date('2025-06-24T12:00:00'),
          endTime: new Date('2025-06-24T13:00:00'),
          status: 'pending',
          totalPrice: 80,
          notes: 'Lekcja tenisa',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction: t });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reservations', null, {});
    await queryInterface.bulkDelete('sport_objects', null, {});
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'jan.kowalski@example.com',
          'anna.nowak@example.com',
          'admin@sportreservations.com'
        ]
      }
    }, {});
  }
};
