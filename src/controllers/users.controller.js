import { getAll } from '../services/users.service.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await getAll();
        res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};