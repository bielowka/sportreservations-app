const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Logowanie',
        layout: 'auth' // użyj specjalnego layoutu dla stron autoryzacji
    });
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Znajdź użytkownika
        const user = await User.findOne({ where: { email } });

        if (!user || !user.isActive) {
            req.flash('error', 'Nieprawidłowy email lub hasło');
            return res.redirect('/login');
        }

        // Sprawdź hasło
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error', 'Nieprawidłowy email lub hasło');
            return res.redirect('/login');
        }

        // Ustaw sesję
        req.session.userId = user.id;
        req.session.userRole = user.role;

        // Przekieruj w zależności od roli
        if (user.role === 'superadmin') {
            res.redirect('/superadmin/dashboard');
        } else if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Wystąpił błąd podczas logowania');
        res.redirect('/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router; 