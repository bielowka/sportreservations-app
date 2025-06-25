const express = require('express');
const router = express.Router();
const { User, SportObject, Reservation, ObjectSchedule } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email i hasło są wymagane'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Nieprawidłowy email lub hasło'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Konto jest nieaktywne'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Nieprawidłowy email lub hasło'
      });
    }

    await user.update({
      lastLoginAt: new Date()
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };

    res.json({
      success: true,
      data: {
        user: userData,
        token: token
      },
      message: 'Logowanie zakończone pomyślnie'
    });

  } catch (error) {
    console.error('Błąd podczas logowania:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas logowania',
      message: error.message
    });
  }
});

router.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Wylogowanie zakończone pomyślnie'
  });
});

router.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token nie został podany'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Użytkownik nie został znaleziony lub jest nieaktywny'
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Błąd podczas weryfikacji tokenu:', error);
    res.status(401).json({
      success: false,
      error: 'Nieprawidłowy token'
    });
  }
});

router.get('/objects', async (req, res) => {
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

    const totalCount = await SportObject.count({ where });

    const offset = (page - 1) * limit;
    const { rows: objects } = await SportObject.findAndCountAll({
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
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      message: 'Objects retrieved successfully'
    });
  } catch (error) {
    console.error('Błąd podczas pobierania obiektów:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas pobierania obiektów',
      message: error.message
    });
  }
});

router.get('/objects/my', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 6 } = req.query;

    const where = {
      ownerId: req.user.id,
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
      message: 'My objects retrieved successfully'
    });
  } catch (error) {
    console.error('Błąd podczas pobierania obiektów administratora:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas pobierania obiektów',
      message: error.message
    });
  }
});

router.get('/objects/:id', async (req, res) => {
  try {
    const objectId = parseInt(req.params.id);
    
    if (isNaN(objectId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Nieprawidłowe ID obiektu' 
      });
    }

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
        error: 'Obiekt nie został znaleziony' 
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.role === 'admin' && object.ownerId && object.ownerId !== decoded.userId) {
          return res.status(403).json({
            success: false,
            error: 'Brak dostępu. Możesz przeglądać tylko swoje obiekty.'
          });
        }
      } catch (jwtError) {
        // Token nieprawidłowy, ale może być niezalogowany user
      }
    }

    res.json({
      success: true,
      data: object,
      message: 'Object retrieved successfully'
    });
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów obiektu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas pobierania szczegółów obiektu',
      message: error.message
    });
  }
});

router.get('/objects/:id/schedule', async (req, res) => {
  try {
    const objectId = parseInt(req.params.id);
    
    if (isNaN(objectId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID obiektu' });
    }

    const object = await SportObject.findByPk(objectId);
    if (!object) {
      return res.status(404).json({ error: 'Obiekt nie został znaleziony' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin' && object.ownerId && object.ownerId !== decoded.userId) {
          return res.status(403).json({
            success: false,
            error: 'Brak dostępu. Możesz przeglądać tylko swoje obiekty.'
          });
        }
      } catch (jwtError) {
        // Token nieprawidłowy, ale może być niezalogowany user
      }
    }

    let schedules = [];
    
    if (object.useCustomSchedule) {
      schedules = await ObjectSchedule.findAll({
        where: { objectId },
        order: [['dayOfWeek', 'ASC']]
      });
    } else {
      const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // niedziela = 0, sobota = 6
      schedules = daysOfWeek.map(day => ({
        dayOfWeek: day,
        isOpen: true,
        openingTime: object.openingTime,
        closingTime: object.closingTime,
        breakStartTime: null,
        breakEndTime: null,
        specialNotes: 'Domyślne godziny otwarcia'
      }));
    }

    const scheduleConfig = {
      objectId: object.id,
      objectName: object.name,
      useCustomSchedule: object.useCustomSchedule,
      minReservationDuration: object.minReservationDuration,
      timeSlotDuration: object.timeSlotDuration,
      advanceBookingDays: object.advanceBookingDays,
      cancellationHours: object.cancellationHours,
      schedules: schedules
    };

    res.json(scheduleConfig);
  } catch (error) {
    console.error('Błąd podczas pobierania harmonogramu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania harmonogramu' });
  }
});

router.post('/objects', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, location, openingTime, closingTime, objectType, description, pricePerHour, maxCapacity } = req.body;

    if (!name || !location || !openingTime || !closingTime || !objectType) {
      return res.status(400).json({ error: 'Wszystkie wymagane pola muszą być wypełnione' });
    }

    const existingObject = await SportObject.findOne({ where: { name } });
    if (existingObject) {
      return res.status(400).json({ error: 'Obiekt o tej nazwie już istnieje' });
    }

    const newObject = await SportObject.create({
      name,
      location,
      openingTime,
      closingTime,
      objectType,
      description,
      pricePerHour: pricePerHour || 0,
      maxCapacity: maxCapacity || 1,
      ownerId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newObject,
      message: 'Obiekt sportowy został pomyślnie dodany'
    });
  } catch (error) {
    console.error('Błąd podczas dodawania obiektu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas dodawania obiektu',
      message: error.message
    });
  }
});

router.get('/reservations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await Reservation.findAll({
      where: {
        userId
      },
      include: [
        {
          model: SportObject,
          as: 'object',
          attributes: ['id', 'name', 'location']
        }
      ],
      attributes: [
        'id', 'objectId', 'userId', 'startTime', 'endTime', 'status',
        'notes', 'createdAt', 'updatedAt', 'cancelledAt', 'cancelledBy',
        'cancellationReason'
      ],
      order: [['startTime', 'ASC']]
    });

    res.json({
      success: true,
      data: reservations,
      message: 'Rezerwacje pobrane pomyślnie'
    });
  } catch (error) {
    console.error('Błąd podczas pobierania rezerwacji:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas pobierania rezerwacji',
      message: error.message 
    });
  }
});

router.post('/reservations', authenticateToken, async (req, res) => {
  try {
    const { objectId, date, time, duration, notes } = req.body;
    const userId = req.user.id;

    if (!objectId || !date || !time) {
      return res.status(400).json({ 
        success: false,
        error: 'Wszystkie wymagane pola muszą być wypełnione' 
      });
    }

    const object = await SportObject.findByPk(objectId);
    if (!object) {
      return res.status(404).json({ 
        success: false,
        error: 'Obiekt nie został znaleziony' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Użytkownik nie został znaleziony' 
      });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Nie można rezerwować dat z przeszłości'
      });
    }

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + object.advanceBookingDays);
    
    if (selectedDate > maxDate) {
      return res.status(400).json({
        success: false,
        error: `Można rezerwować maksymalnie ${object.advanceBookingDays} dni w przód`
      });
    }

    const dayOfWeek = selectedDate.getDay();
    let schedule;
    
    if (object.useCustomSchedule) {
      schedule = await ObjectSchedule.findOne({
        where: { objectId, dayOfWeek }
      });
    } else {
      schedule = {
        isOpen: true,
        openingTime: object.openingTime,
        closingTime: object.closingTime,
        breakStartTime: null,
        breakEndTime: null
      };
    }

    if (!schedule || !schedule.isOpen) {
      return res.status(400).json({
        success: false,
        error: 'Obiekt jest zamknięty w wybranym dniu'
      });
    }

    const timeString = time.slice(0, 5);
    if (timeString < schedule.openingTime.slice(0, 5) || timeString >= schedule.closingTime.slice(0, 5)) {
      return res.status(400).json({
        success: false,
        error: 'Wybrany czas jest poza godzinami otwarcia obiektu'
      });
    }

    if (schedule.breakStartTime && schedule.breakEndTime &&
        timeString >= schedule.breakStartTime.slice(0, 5) && 
        timeString < schedule.breakEndTime.slice(0, 5)) {
      return res.status(400).json({
        success: false,
        error: 'Wybrany czas przypada na przerwę techniczną'
      });
    }

    const startTime = new Date(`${date}T${timeString}:00`);
    const endTime = new Date(startTime.getTime() + (duration || object.timeSlotDuration) * 60000);

    const closingTime = new Date(`${date}T${schedule.closingTime}`);
    if (endTime > closingTime) {
      return res.status(400).json({
        success: false,
        error: 'Rezerwacja przekracza godziny otwarcia obiektu'
      });
    }

    const conflictingReservation = await Reservation.findOne({
      where: {
        objectId,
        status: ['confirmed', 'pending'],
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime }
      }
    });

    if (conflictingReservation) {
      return res.status(400).json({ 
        success: false,
        error: 'Termin koliduje z istniejącą rezerwacją' 
      });
    }

    const durationHours = (duration || object.timeSlotDuration) / 60;
    const totalPrice = parseFloat(object.pricePerHour) * durationHours;

    const newReservation = await Reservation.create({
      objectId,
      userId,
      startTime,
      endTime,
      totalPrice,
      notes,
      status: 'confirmed'
    });

    const createdReservation = await Reservation.findByPk(newReservation.id, {
      include: [
        {
          model: SportObject,
          as: 'object',
          attributes: ['id', 'name', 'location']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdReservation,
      message: 'Rezerwacja została utworzona pomyślnie'
    });

  } catch (error) {
    console.error('Błąd podczas tworzenia rezerwacji:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas tworzenia rezerwacji',
      message: error.message
    });
  }
});

router.get('/objects/:id/availability/:date', async (req, res) => {
  try {
    const objectId = parseInt(req.params.id);
    const date = req.params.date;
    
    if (isNaN(objectId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Nieprawidłowe ID obiektu' 
      });
    }

    const object = await SportObject.findByPk(objectId);
    if (!object) {
      return res.status(404).json({ 
        success: false,
        error: 'Obiekt nie został znaleziony' 
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin' && object.ownerId && object.ownerId !== decoded.userId) {
          return res.status(403).json({
            success: false,
            error: 'Brak dostępu. Możesz przeglądać tylko swoje obiekty.'
          });
        }
      } catch (jwtError) {
        // Token nieprawidłowy, ale może być niezalogowany user
      }
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Nie można rezerwować dat z przeszłości'
      });
    }

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + object.advanceBookingDays);
    
    if (selectedDate > maxDate) {
      return res.status(400).json({
        success: false,
        error: `Można rezerwować maksymalnie ${object.advanceBookingDays} dni w przód`
      });
    }

    const dayOfWeek = selectedDate.getDay();
    let schedule;
    
    if (object.useCustomSchedule) {
      schedule = await ObjectSchedule.findOne({
        where: { objectId, dayOfWeek }
      });
    } else {
      schedule = {
        isOpen: true,
        openingTime: object.openingTime,
        closingTime: object.closingTime,
        breakStartTime: null,
        breakEndTime: null
      };
    }

    if (!schedule || !schedule.isOpen) {
      return res.json({
        success: true,
        data: {
          objectId,
          date,
          isOpen: false,
          timeSlots: []
        }
      });
    }

    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${schedule.openingTime}`);
    const endTime = new Date(`2000-01-01T${schedule.closingTime}`);
    const slotDuration = object.timeSlotDuration; // w minutach

    const isToday = selectedDate.toDateString() === today.toDateString();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const [slotHour, slotMinute] = timeString.split(':').map(Number);

      const isBreak = schedule.breakStartTime && schedule.breakEndTime &&
        timeString >= schedule.breakStartTime.slice(0, 5) && 
        timeString < schedule.breakEndTime.slice(0, 5);

      const isPast = isToday && (
        slotHour < currentHour || 
        (slotHour === currentHour && slotMinute < currentMinute)
      );

      timeSlots.push({
        time: timeString,
        isAvailable: !isBreak && !isPast,
        isReserved: false,
        isBreak: isBreak,
        isPast: isPast,
        reservationId: null,
        reservedBy: null
      });

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.findAll({
      where: {
        objectId,
        startTime: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: ['confirmed', 'pending']
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

    reservations.forEach(reservation => {
      const reservationStart = new Date(reservation.startTime);
      const reservationEnd = new Date(reservation.endTime);

      const reservationStartHour = reservationStart.getHours();
      const reservationStartMinute = reservationStart.getMinutes();
      const reservationEndHour = reservationEnd.getHours();
      const reservationEndMinute = reservationEnd.getMinutes();
      
      timeSlots.forEach(slot => {
        const [slotHour, slotMinute] = slot.time.split(':').map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        const slotEndMinutes = slotStartMinutes + slotDuration;
        
        const reservationStartMinutes = reservationStartHour * 60 + reservationStartMinute;
        const reservationEndMinutes = reservationEndHour * 60 + reservationEndMinute;

        if (slotStartMinutes < reservationEndMinutes && slotEndMinutes > reservationStartMinutes) {
          slot.isReserved = true;
          slot.isAvailable = false;
          slot.reservationId = reservation.id;
          slot.reservedBy = reservation.user?.name || 'Nieznany użytkownik';
        }
      });
    });

    res.json({
      success: true,
      data: {
        objectId,
        date,
        isOpen: true,
        timeSlots,
        schedule: {
          openingTime: schedule.openingTime,
          closingTime: schedule.closingTime,
          breakStartTime: schedule.breakStartTime,
          breakEndTime: schedule.breakEndTime
        }
      }
    });

  } catch (error) {
    console.error('Błąd podczas pobierania dostępności:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd serwera podczas pobierania dostępności',
      message: error.message
    });
  }
});

router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas pobierania użytkowników',
      message: error.message
    });
  }
});

router.delete('/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const userId = req.user.id;

    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId,
        status: {
          [Op.not]: 'cancelled'
        }
      },
      include: [
        {
          model: SportObject,
          as: 'object'
        }
      ]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Rezerwacja nie została znaleziona lub została już anulowana'
      });
    }

    const now = new Date();
    const reservationStart = new Date(reservation.startTime);
    const hoursUntilReservation = (reservationStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (reservationStart < now) {
      return res.status(400).json({
        success: false,
        error: 'Nie można anulować rezerwacji z przeszłości'
      });
    }

    if (reservation.object && hoursUntilReservation < reservation.object.cancellationHours) {
      return res.status(400).json({
        success: false,
        error: `Rezerwację można anulować najpóźniej ${reservation.object.cancellationHours} godzin przed jej rozpoczęciem`
      });
    }

    await reservation.update({
      status: 'cancelled',
      cancelledAt: now,
      cancelledBy: userId
    });

    res.json({
      success: true,
      message: 'Rezerwacja została anulowana'
    });
  } catch (error) {
    console.error('Błąd podczas anulowania rezerwacji:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas anulowania rezerwacji',
      message: error.message
    });
  }
});

router.delete('/objects/:objectId/reservations/:reservationId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const objectId = parseInt(req.params.objectId);
    const reservationId = parseInt(req.params.reservationId);
    const adminId = req.user.id;

    const object = await SportObject.findOne({
      where: {
        id: objectId,
        ownerId: adminId
      }
    });

    if (!object) {
      return res.status(404).json({
        success: false,
        error: 'Obiekt nie został znaleziony lub nie masz do niego uprawnień'
      });
    }

    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        objectId,
        status: {
          [Op.not]: 'cancelled'
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Rezerwacja nie została znaleziona lub została już anulowana'
      });
    }

    await reservation.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: adminId,
      cancellationReason: 'Anulowane przez administratora obiektu'
    });

    res.json({
      success: true,
      message: 'Rezerwacja została anulowana przez administratora'
    });
  } catch (error) {
    console.error('Błąd podczas anulowania rezerwacji przez administratora:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas anulowania rezerwacji',
      message: error.message
    });
  }
});

router.put('/objects/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const objectId = parseInt(req.params.id);
    const adminId = req.user.id;

    const object = await SportObject.findOne({
      where: {
        id: objectId,
        ownerId: adminId
      }
    });

    if (!object) {
      return res.status(404).json({
        success: false,
        error: 'Obiekt nie został znaleziony lub nie masz do niego uprawnień'
      });
    }

    const requiredFields = ['name', 'location', 'objectType', 'openingTime', 'closingTime'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Brakujące wymagane pola: ${missingFields.join(', ')}`
      });
    }

    if (req.body.pricePerHour && req.body.pricePerHour < 0) {
      return res.status(400).json({
        success: false,
        error: 'Cena za godzinę nie może być ujemna'
      });
    }

    if (req.body.maxCapacity && req.body.maxCapacity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Maksymalna pojemność musi być większa od 0'
      });
    }

    await object.update({
      name: req.body.name,
      location: req.body.location,
      objectType: req.body.objectType,
      description: req.body.description || '',
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      pricePerHour: parseFloat(req.body.pricePerHour) || 0,
      maxCapacity: parseInt(req.body.maxCapacity) || 1
    });

    const updatedObject = await SportObject.findByPk(objectId, {
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

    res.json({
      success: true,
      data: updatedObject,
      message: 'Obiekt został pomyślnie zaktualizowany'
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji obiektu:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas aktualizacji obiektu',
      message: error.message
    });
  }
});

module.exports = router; 