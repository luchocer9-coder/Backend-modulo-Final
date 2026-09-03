import { getAllUsers } from '../repositories/users.repository.js';

export const getAll = async () => {
    return await getAllUsers();
};