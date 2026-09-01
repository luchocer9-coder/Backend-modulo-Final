import passport from '../config/passport.config.js';

export const authenticateRegister = (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            const status = info?.message === 'El email ya está registrado' ? 409 : 400;
            return res.status(status).json({ status: 'error', message: info?.message || 'Error en el registro' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

export const authenticateLogin = (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

export const authenticateCurrent = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }
        req.user = user;
        next();
    })(req, res, next);
};