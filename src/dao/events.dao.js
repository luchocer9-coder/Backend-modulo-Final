import Event from '../models/Event.js';

export const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

export const findEventById = async (id) => {
    return await Event.findById(id);
};

export const findAllEvents = async () => {
    return await Event.find();
};

export const updateEventById = async (id, updateData) => {
    return await Event.findByIdAndUpdate(id, updateData, { new: true });
};