import { getAll } from '../services/users.service.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAll();
        res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        next(error);
    }
};