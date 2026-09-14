import { getAllUsers } from '../repositories/users.repository.js';
import { userDTO } from '../dtos/user.dto.js';

export const getAll = async () => {
    const users = await getAllUsers();
    return users.map(userDTO);
};