'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SportObject extends Model {
    static associate(models) {
      // Definicje asocjacji
      SportObject.hasMany(models.Reservation, {
        foreignKey: 'objectId',
        as: 'reservations'
      });
      SportObject.hasMany(models.ObjectSchedule, {
        foreignKey: 'objectId',
        as: 'schedules'
      });
      SportObject.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      });
    }
  }
  
  SportObject.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 500]
      }
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    objectType: {
      type: DataTypes.ENUM('football', 'tennis', 'basketball', 'volleyball', 'swimming', 'gym', 'other'),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['football', 'tennis', 'basketball', 'volleyball', 'swimming', 'gym', 'other']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    pricePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    facilities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    // Nowe pola dla harmonogramów i rezerwacji
    minReservationDuration: {
      type: DataTypes.INTEGER, // w minutach
      allowNull: false,
      defaultValue: 60, // 1 godzina
      validate: {
        min: 15, // minimum 15 minut
        max: 1440 // maksimum 24 godziny
      }
    },
    timeSlotDuration: {
      type: DataTypes.INTEGER, // w minutach
      allowNull: false,
      defaultValue: 60, // 1 godzina
      validate: {
        min: 15,
        max: 1440
      }
    },
    advanceBookingDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // można rezerwować 30 dni w przód
      validate: {
        min: 1,
        max: 365
      }
    },
    cancellationHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24, // można anulować do 24h przed
      validate: {
        min: 0,
        max: 168 // 7 dni
      }
    },
    useCustomSchedule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // domyślnie używa openingTime/closingTime
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Może być null dla istniejących obiektów
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'SportObject',
    tableName: 'sport_objects',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['objectType']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['location']
      }
    ],
    hooks: {
      beforeValidate: (sportObject) => {
        // Walidacja godzin otwarcia
        if (sportObject.openingTime && sportObject.closingTime) {
          if (sportObject.openingTime >= sportObject.closingTime) {
            throw new Error('Godzina zamknięcia musi być późniejsza niż otwarcia');
          }
        }
      }
    }
  });
  
  return SportObject;
}; 