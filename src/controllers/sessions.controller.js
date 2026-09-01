import passport from '../config/passport.config.js';
import { generateToken } from '../utils/jwt.js';

export const register = (req, res) => {
    res.status(201).json({
        status: 'success',
        payload: {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

export const login = (req, res) => {
    const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
    });

    res.cookie('currentUser', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000,
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ status: 'success', message: 'Login correcto' });
};

export const current = (req, res) => {
    res.status(200).json({
        status: 'success',
        payload: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

export const logout = (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};