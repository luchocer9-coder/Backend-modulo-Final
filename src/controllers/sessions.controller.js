import { generateToken } from '../utils/jwt.js';
import { userDTO } from '../dtos/user.dto.js';

export const register = (req, res) => {
    res.status(201).json({ status: 'success', payload: userDTO(req.user) });
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
        payload: { id: req.user.id, email: req.user.email, role: req.user.role },
    });
};

export const logout = (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};