const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Logowanie',
        layout: 'auth'
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || !user.isActive) {
            req.flash('error', 'Nieprawidłowy email lub hasło');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error', 'Nieprawidłowy email lub hasło');
            return res.redirect('/login');
        }

        req.session.userId = user.id;
        req.session.userRole = user.role;

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

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router; 