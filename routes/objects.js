const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const { SportObject, User, Reservation } = require('../models');

router.get('/', async (req, res) => {
    try {
        const { search, type, location, page = 1, limit = 6 } = req.query;

        const where = {
            isActive: true
        };
        
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (type) {
            where.objectType = type;
        }
        
        if (location) {
            where.location = { [Op.like]: `%${location}%` };
        }

        const offset = (page - 1) * limit;
        const { count, rows: objects } = await SportObject.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']],
            include: [
                {
                    model: Reservation,
                    as: 'reservations',
                    attributes: ['id', 'startTime', 'endTime', 'status'],
                    where: {
                        status: ['pending', 'confirmed']
                    },
                    required: false
                }
            ]
        });
        
        res.json({
            success: true,
            data: objects,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            },
            message: 'Objects retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting objects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve objects',
            message: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const objectId = parseInt(req.params.id);
        
        const object = await SportObject.findByPk(objectId, {
            include: [
                {
                    model: Reservation,
                    as: 'reservations',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ],
                    order: [['startTime', 'ASC']]
                }
            ]
        });
        
        if (!object) {
            return res.status(404).json({
                success: false,
                error: 'Object not found',
                message: 'Obiekt sportowy nie został znaleziony'
            });
        }
        
        res.json({
            success: true,
            data: object,
            message: 'Object retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting object:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve object',
            message: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, location, openingTime, closingTime, objectType, description, pricePerHour, maxCapacity, facilities } = req.body;

        const errors = {};
        
        if (!name || name.trim().length === 0) {
            errors.name = 'Nazwa obiektu jest wymagana';
        }
        
        if (!location || location.trim().length === 0) {
            errors.location = 'Lokalizacja jest wymagana';
        }
        
        if (!openingTime || openingTime.trim().length === 0) {
            errors.openingTime = 'Godzina otwarcia jest wymagana';
        }
        
        if (!closingTime || closingTime.trim().length === 0) {
            errors.closingTime = 'Godzina zamknięcia jest wymagana';
        }
        
        if (!objectType || objectType.trim().length === 0) {
            errors.objectType = 'Typ obiektu jest wymagany';
        }

        if (openingTime && closingTime && openingTime >= closingTime) {
            errors.closingTime = 'Godzina zamknięcia musi być późniejsza niż otwarcia';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors
            });
        }

        const newObject = await SportObject.create({
            name: name.trim(),
            location: location.trim(),
            openingTime,
            closingTime,
            objectType,
            description: description ? description.trim() : '',
            pricePerHour: pricePerHour || 0.00,
            maxCapacity: maxCapacity || 1,
            facilities: facilities || {},
            isActive: true
        });
        
        console.log('Adding new object:', newObject.toJSON());
        
        res.status(201).json({
            success: true,
            data: newObject,
            message: 'Object created successfully'
        });
    } catch (error) {
        console.error('Error creating object:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors = {};
            error.errors.forEach(err => {
                errors[err.path] = err.message;
            });
            
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to create object',
            message: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const objectId = parseInt(req.params.id);
        const updateData = req.body;
        
        const object = await SportObject.findByPk(objectId);
        
        if (!object) {
            return res.status(404).json({
                success: false,
                error: 'Object not found',
                message: 'Obiekt sportowy nie został znaleziony'
            });
        }

        await object.update(updateData);
        
        res.json({
            success: true,
            data: object,
            message: 'Object updated successfully'
        });
    } catch (error) {
        console.error('Error updating object:', error);
        
        if (error.name === 'SequelizeValidationError') {
            const errors = {};
            error.errors.forEach(err => {
                errors[err.path] = err.message;
            });
            
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to update object',
            message: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const objectId = parseInt(req.params.id);
        
        const object = await SportObject.findByPk(objectId);
        
        if (!object) {
            return res.status(404).json({
                success: false,
                error: 'Object not found',
                message: 'Obiekt sportowy nie został znaleziony'
            });
        }

        const activeReservations = await Reservation.count({
            where: {
                objectId: objectId,
                status: ['pending', 'confirmed'],
                startTime: {
                    [Op.gte]: new Date()
                }
            }
        });
        
        if (activeReservations > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete object',
                message: 'Nie można usunąć obiektu z aktywnymi rezerwacjami'
            });
        }

        await object.update({ isActive: false });
        
        console.log('Deleting object with ID:', objectId);
        
        res.json({
            success: true,
            message: 'Object deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting object:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete object',
            message: error.message
        });
    }
});

module.exports = router; 