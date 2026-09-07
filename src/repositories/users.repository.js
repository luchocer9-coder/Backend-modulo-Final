import { createUser, findUserByEmail, findAllUsers, findUserById } from '../dao/users.dao.js';

export const registerUser = async (userData) => {
    return await createUser(userData);
};

export const getUserByEmail = async (email) => {
    return await findUserByEmail(email);
};

export const getAllUsers = async () => {
    return await findAllUsers();
};

export const getUserById = async (id) => {
    return await findUserById(id);
};