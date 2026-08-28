import { register as registerService, login as loginService } from '../services/sessions.service.js';

export const register = async (req, res) => {
    try {
        const newUser = await registerService(req.body);
        res.status(201).json({ status: 'success', payload: newUser });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const login = async (req, res) => {
    try {
        const token = await loginService(req.body);

        res.cookie('currentUser', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({ status: 'success', message: 'Login correcto' });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const current = (req, res) => {
    res.status(200).json({ status: 'success', payload: req.user });
};

export const logout = (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};