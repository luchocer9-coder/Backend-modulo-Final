import { createUser, findUserByEmail } from '../dao/users.dao.js';

export const registerUser = async (userData) => {
    return await createUser(userData);
};

export const getUserByEmail = async (email) => {
    return await findUserByEmail(email);
};