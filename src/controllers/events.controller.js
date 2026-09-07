import { create, getAll, getById, update, updateStatus } from '../services/events.service.js';

export const createEvent = async (req, res) => {
    try {
        const newEvent = await create(req.body, req.user.id);
        res.status(201).json({ status: 'success', payload: newEvent });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const result = await getAll(req.query);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await getById(req.params.id);
        res.status(200).json({ status: 'success', payload: event });
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

export const updateEventStatus = async (req, res) => {
    try {
        const updatedEvent = await updateStatus(req.params.id, req.body.status, req.user);
        res.status(200).json({ status: 'success', payload: updatedEvent });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};