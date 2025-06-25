const jwt = require('jsonwebtoken');
const { User } = require('../models');


const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token dostępu jest wymagany'
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

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    return res.status(403).json({
      success: false,
      error: 'Nieprawidłowy token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Brak uprawnień do wykonania tej operacji'
      });
    }

    next();
  };
};

const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

const ensureAdmin = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findByPk(req.session.userId);
            if (user && (user.role === 'admin' || user.role === 'superadmin')) {
                next();
            } else {
                res.status(403).send('Brak dostępu');
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Wystąpił błąd serwera');
        }
    } else {
        res.redirect('/login');
    }
};

const ensureSuperAdmin = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findByPk(req.session.userId);
            if (user && user.role === 'superadmin') {
                res.locals.currentUser = user;
                next();
            } else {
                res.status(403).send('Brak dostępu - wymagane uprawnienia Super Administratora');
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Wystąpił błąd serwera');
        }
    } else {
        res.redirect('/login');
    }
};

module.exports = {
  authenticateToken,
  requireRole,
  ensureAuthenticated,
  ensureAdmin,
  ensureSuperAdmin
}; 