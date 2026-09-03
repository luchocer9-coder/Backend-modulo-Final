import { createEvent, findEventById, findAllEvents, updateEventById } from '../dao/events.dao.js';

export const registerEvent = async (eventData) => {
    return await createEvent(eventData);
};

export const getEventById = async (id) => {
    return await findEventById(id);
};

export const getAllEvents = async () => {
    return await findAllEvents();
};

export const modifyEvent = async (id, updateData) => {
    return await updateEventById(id, updateData);
};