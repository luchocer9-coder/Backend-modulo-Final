import User from '../models/User.js';

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const findAllUsers = async () => {
    return await User.find().select('-password');
};

export const findUserById = async (id) => {
    return await User.findById(id);
};