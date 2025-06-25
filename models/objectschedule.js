'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ObjectSchedule extends Model {
    static associate(models) {
      ObjectSchedule.belongsTo(models.SportObject, {
        foreignKey: 'objectId',
        as: 'object'
      });
    }
  }
  
  ObjectSchedule.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        notEmpty: function() {
          if (this.isOpen && !this.openingTime) {
            throw new Error('Godzina otwarcia jest wymagana gdy obiekt jest otwarty');
          }
        }
      }
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        notEmpty: function() {
          if (this.isOpen && !this.closingTime) {
            throw new Error('Godzina zamknięcia jest wymagana gdy obiekt jest otwarty');
          }
        }
      }
    },
    breakStartTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    breakEndTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    specialNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ObjectSchedule',
    tableName: 'object_schedules',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['objectId']
      },
      {
        fields: ['dayOfWeek']
      },
      {
        unique: true,
        fields: ['objectId', 'dayOfWeek']
      }
    ],
    hooks: {
      beforeValidate: (schedule) => {
        if (schedule.isOpen && schedule.openingTime && schedule.closingTime) {
          if (schedule.openingTime >= schedule.closingTime) {
            throw new Error('Godzina zamknięcia musi być późniejsza niż otwarcia');
          }
        }
        
        if (schedule.breakStartTime && schedule.breakEndTime) {
          if (schedule.breakStartTime >= schedule.breakEndTime) {
            throw new Error('Koniec przerwy musi być późniejszy niż początek');
          }
          
          if (schedule.openingTime && schedule.closingTime) {
            if (schedule.breakStartTime < schedule.openingTime || 
                schedule.breakEndTime > schedule.closingTime) {
              throw new Error('Przerwa musi być w godzinach otwarcia obiektu');
            }
          }
        }
      }
    }
  });
  
  return ObjectSchedule;
}; 