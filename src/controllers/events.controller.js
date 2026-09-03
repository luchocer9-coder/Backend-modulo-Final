import { create, getAll, update } from '../services/events.service.js';

export const getAllEvents = async (req, res) => {
    try {
        const events = await getAll();
        res.status(200).json({ status: 'success', payload: events });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const newEvent = await create(req.body, req.user.id);
        res.status(201).json({
            status: 'success',
            payload: {
                id: newEvent._id,
                title: newEvent.title,
                organizer: newEvent.organizer,
            },
        });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await update(req.params.id, req.body, req.user);
        res.status(200).json({ status: 'success', payload: updatedEvent });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};