'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Reservation.belongsTo(models.SportObject, {
        foreignKey: 'objectId',
        as: 'object'
      });
    }
  }
  
  Reservation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sport_objects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true
      }
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: [['pending', 'confirmed', 'cancelled', 'completed']]
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cancellationReason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['objectId']
      },
      {
        fields: ['startTime']
      },
      {
        fields: ['endTime']
      },
      {
        fields: ['status']
      },
      {
        fields: ['objectId', 'startTime', 'endTime']
      }
    ],
    hooks: {
      beforeValidate: (reservation) => {
        if (reservation.startTime && reservation.endTime) {
          if (reservation.startTime >= reservation.endTime) {
            throw new Error('Czas zakończenia musi być późniejszy niż rozpoczęcia');
          }

          if (reservation.startTime < new Date()) {
            throw new Error('Nie można rezerwować terminów w przeszłości');
          }
        }
      },
      beforeCreate: async (reservation) => {
        const conflictingReservation = await sequelize.models.Reservation.findOne({
          where: {
            objectId: reservation.objectId,
            status: ['pending', 'confirmed'],
            startTime: {
              [Op.lt]: reservation.endTime
            },
            endTime: {
              [Op.gt]: reservation.startTime
            }
          }
        });
        
        if (conflictingReservation) {
          throw new Error('Wybrany termin koliduje z istniejącą rezerwacją');
        }
      }
    }
  });
  
  return Reservation;
}; 