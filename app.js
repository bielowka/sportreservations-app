const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 100
});
app.use(limiter);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 godziny
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(express.static(path.join(__dirname, 'client/build')));

const apiRouter = require('./routes/api');
const superAdminRouter = require('./routes/superAdmin');

app.use('/api', apiRouter);
app.use('/superadmin', superAdminRouter);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: sequelize.authenticate() ? 'connected' : 'disconnected'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const initializeApp = async () => {
    try {
        await testConnection();
        
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Modele zostały zsynchronizowane z bazą danych.');
        }
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`⚛React app will be served from /client/build`);
            console.log(`Database: ${sequelize.config.database} on ${sequelize.config.host}`);
        });
    } catch (error) {
        console.error('Błąd podczas inicjalizacji aplikacji:', error);
        process.exit(1);
    }
};

initializeApp();

module.exports = app; 