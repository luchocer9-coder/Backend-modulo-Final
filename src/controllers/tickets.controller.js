import { create, getMyTickets, getByEvent, cancel } from '../services/tickets.service.js';

export const createTicket = async (req, res) => {
    try {
        const { eid } = req.params;
        const { quantity } = req.body;
        const newTicket = await create(eid, req.user.id, quantity);
        res.status(201).json({ status: 'success', payload: newTicket });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const getMyTicketsController = async (req, res) => {
    try {
        const tickets = await getMyTickets(req.user.id);
        res.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const getEventTickets = async (req, res) => {
    try {
        const { eid } = req.params;
        const tickets = await getByEvent(eid, req.user);
        res.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};

export const cancelTicket = async (req, res) => {
    try {
        const { tid } = req.params;
        const cancelledTicket = await cancel(tid, req.user);
        res.status(200).json({ status: 'success', payload: cancelledTicket });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Error interno del servidor';
        res.status(status).json({ status: 'error', message });
    }
};