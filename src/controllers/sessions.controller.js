import { register as registerService } from '../services/sessions.service.js';

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

export const login = (req, res) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};