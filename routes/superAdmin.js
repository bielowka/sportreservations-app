const express = require('express');
const router = express.Router();
const { User, SportObject, Reservation } = require('../models');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');

hbs.registerHelper('formatDate', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

// Middleware do sprawdzania sesji super admina
const requireSuperAdmin = (req, res, next) => {
    if (req.session && req.session.isSuperAdmin) {
        next();
    } else {
        res.redirect('/superadmin/login');
    }
};

// Middleware do przekierowania zalogowanych super adminów z logowania
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.isSuperAdmin) {
        res.redirect('/superadmin');
    } else {
        next();
    }
};

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('superadmin/login', { 
        title: 'Logowanie do Panelu Super Admina',
        layout: false // Nie używaj głównego layoutu
    });
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Znajdź użytkownika
        const user = await User.findOne({ where: { email, role: 'superadmin' } });

        if (!user) {
            return res.render('superadmin/login', {
                title: 'Logowanie do Panelu Super Admina',
                error_msg: 'Nieprawidłowy email lub hasło',
                layout: false
            });
        }

        // Sprawdź hasło
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('superadmin/login', {
                title: 'Logowanie do Panelu Super Admina',
                error_msg: 'Nieprawidłowy email lub hasło',
                layout: false
            });
        }

        // Ustaw sesję
        req.session.isSuperAdmin = true;
        req.session.superAdminId = user.id;
        req.session.superAdminName = user.name;

        res.redirect('/superadmin');
    } catch (error) {
        console.error('Błąd logowania:', error);
        res.render('superadmin/login', {
            title: 'Logowanie do Panelu Super Admina',
            error_msg: 'Wystąpił błąd podczas logowania',
            layout: false
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/superadmin/login');
    });
});

// Zastosuj middleware do wszystkich pozostałych ścieżek
router.use(requireSuperAdmin);

// Main superadmin dashboard
router.get('/', async (req, res) => {
    try {
        // Pobierz statystyki
        const usersCount = await User.count();
        const objectsCount = await SportObject.count();
        const reservationsCount = await Reservation.count();

        res.render('superadmin/index', { 
            title: 'Panel Super Admina',
            superAdminName: req.session.superAdminName,
            usersCount,
            objectsCount,
            reservationsCount
        });
    } catch (error) {
        console.error('Błąd podczas pobierania statystyk:', error);
        res.render('superadmin/index', { 
            title: 'Panel Super Admina',
            superAdminName: req.session.superAdminName,
            error_msg: 'Nie udało się pobrać statystyk systemu'
        });
    }
});

// --- User Management ---

// User list
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['id', 'ASC']] });
        res.render('superadmin/users', { 
            title: 'Zarządzanie użytkownikami',
            users: users.map(user => user.toJSON()) 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

// Show user creation form - must be BEFORE /users/:id route
router.get('/users/create', requireSuperAdmin, (req, res) => {
    res.render('superadmin/users/create', {
        title: 'Dodaj nowego użytkownika',
        superAdminName: req.session.superAdminName
    });
});

// Handle user creation - must be BEFORE /users/:id route
router.post('/users/create', requireSuperAdmin, async (req, res) => {
    try {
        const { name, email, password, role, isActive } = req.body;

        // Sprawdź, czy użytkownik o takim emailu już istnieje
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('superadmin/users/create', {
                title: 'Dodaj nowego użytkownika',
                superAdminName: req.session.superAdminName,
                error_msg: 'Użytkownik o takim adresie email już istnieje',
                formData: { name, email, role, isActive }
            });
        }

        // Hash hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Utwórz nowego użytkownika
        await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isActive: isActive === 'on'
        });

        req.flash('success', 'Użytkownik został pomyślnie utworzony');
        res.redirect('/superadmin/users');
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
        res.render('superadmin/users/create', {
            title: 'Dodaj nowego użytkownika',
            superAdminName: req.session.superAdminName,
            error_msg: 'Wystąpił błąd podczas tworzenia użytkownika',
            formData: req.body
        });
    }
});

// User details page - must be AFTER specific routes like /users/create
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.render('superadmin/user', {
                title: 'Szczegóły użytkownika',
                user: user.toJSON()
            });
        } else {
            res.status(404).send('Nie znaleziono użytkownika');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

// Handle user edit
router.post('/users/edit/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.update({
                name: req.body.name,
                email: req.body.email,
                role: req.body.role
            });
            res.redirect('/superadmin/users');
        } else {
            res.status(404).send('Nie znaleziono użytkownika');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

// Handle user delete
router.post('/users/delete/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.redirect('/superadmin/users');
        } else {
            res.status(404).send('Nie znaleziono użytkownika');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

// --- Object Management ---

// Object list
router.get('/objects', async (req, res) => {
    try {
        const objects = await SportObject.findAll({ order: [['id', 'ASC']] });
        res.render('superadmin/objects', {
            title: 'Zarządzanie Obiektami',
            objects: objects.map(obj => obj.toJSON())
        });
    } catch (error) {
        console.error('Błąd podczas pobierania obiektów:', error);
        res.status(500).send('Błąd serwera');
    }
});

// Object details page
router.get('/objects/:id', async (req, res) => {
    try {
        const object = await SportObject.findByPk(req.params.id);
        if (object) {
            res.render('superadmin/object', {
                title: 'Szczegóły Obiektu',
                object: object.toJSON()
            });
        } else {
            res.status(404).send('Nie znaleziono obiektu');
        }
    } catch (error) {
        console.error('Błąd podczas pobierania obiektu:', error);
        res.status(500).send('Błąd serwera');
    }
});

// Handle object edit
router.post('/objects/edit/:id', async (req, res) => {
    try {
        const object = await SportObject.findByPk(req.params.id);
        if (object) {
            // Validate required fields
            const requiredFields = ['name', 'location', 'objectType', 'openingTime', 'closingTime', 'pricePerHour', 'maxCapacity'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.render('superadmin/object', {
                    title: 'Szczegóły Obiektu',
                    object: { ...object.toJSON(), ...req.body },
                    error_msg: `Wymagane pola: ${missingFields.join(', ')}`
                });
            }

            // Validate numeric fields
            if (isNaN(req.body.pricePerHour) || req.body.pricePerHour < 0) {
                return res.render('superadmin/object', {
                    title: 'Szczegóły Obiektu',
                    object: { ...object.toJSON(), ...req.body },
                    error_msg: 'Cena za godzinę musi być liczbą dodatnią'
                });
            }

            if (isNaN(req.body.maxCapacity) || req.body.maxCapacity < 1) {
                return res.render('superadmin/object', {
                    title: 'Szczegóły Obiektu',
                    object: { ...object.toJSON(), ...req.body },
                    error_msg: 'Maksymalna liczba osób musi być liczbą większą od 0'
                });
            }

            // Update object with all fields
            await object.update({
                name: req.body.name,
                location: req.body.location,
                objectType: req.body.objectType,
                description: req.body.description || '',
                openingTime: req.body.openingTime,
                closingTime: req.body.closingTime,
                pricePerHour: parseFloat(req.body.pricePerHour),
                maxCapacity: parseInt(req.body.maxCapacity),
                isActive: req.body.isActive === 'on'
            });

            // Redirect with success message
            return res.render('superadmin/object', {
                title: 'Szczegóły Obiektu',
                object: object.toJSON(),
                success_msg: 'Obiekt został pomyślnie zaktualizowany'
            });
        } else {
            res.status(404).render('error', {
                title: 'Błąd',
                message: 'Nie znaleziono obiektu',
                error: { status: 404 }
            });
        }
    } catch (error) {
        console.error('Błąd podczas edycji obiektu:', error);
        res.render('superadmin/object', {
            title: 'Szczegóły Obiektu',
            object: req.body,
            error_msg: 'Wystąpił błąd podczas zapisywania zmian'
        });
    }
});

// Handle object delete
router.post('/objects/delete/:id', async (req, res) => {
    try {
        const object = await SportObject.findByPk(req.params.id);
        if (object) {
            await object.destroy();
            res.redirect('/superadmin/objects?deleted=1');
        } else {
            res.status(404).send('Nie znaleziono obiektu');
        }
    } catch (error) {
        console.error('Błąd podczas usuwania obiektu:', error);
        res.status(500).send('Błąd serwera');
    }
});

module.exports = router; 