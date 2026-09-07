import { createEvent, findEventById, findEvents, updateEventById } from '../dao/events.dao.js';

export const registerEvent = async (eventData) => {
    return await createEvent(eventData);
};

export const getEventById = async (id) => {
    return await findEventById(id);
};

export const getEvents = async (filter, options) => {
    return await findEvents(filter, options);
};

export const modifyEvent = async (id, updateData) => {
    return await updateEventById(id, updateData);
};