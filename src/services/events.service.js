import { registerEvent, getEventById, getAllEvents, modifyEvent } from '../repositories/events.repository.js';

export const create = async ({ title, description, date, capacity }, organizerId) => {
    if (!title || !description || !date || !capacity) {
        throw { status: 400, message: 'Faltan campos obligatorios' };
    }

    const newEvent = await registerEvent({
        title,
        description,
        date,
        capacity,
        organizer: organizerId,
    });

    return newEvent;
};

export const getAll = async () => {
    return await getAllEvents();
};

export const update = async (eventId, updateData, user) => {
    const event = await getEventById(eventId);

    if (!event) {
        throw { status: 404, message: 'Evento no encontrado' };
    }

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No tenés permisos para modificar este evento' };
    }

    const updatedEvent = await modifyEvent(eventId, updateData);
    return updatedEvent;
};