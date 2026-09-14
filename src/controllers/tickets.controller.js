import { create, getMyTickets, getByEvent, cancel } from '../services/tickets.service.js';

export const createTicket = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const { quantity } = req.body;
        const newTicket = await create(eid, req.user.id, quantity);
        res.status(201).json({ status: 'success', payload: newTicket });
    } catch (error) {
        next(error);
    }
};

export const getMyTicketsController = async (req, res, next) => {
    try {
        const tickets = await getMyTickets(req.user.id);
        res.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
        next(error);
    }
};

export const getEventTickets = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const tickets = await getByEvent(eid, req.user);
        res.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
        next(error);
    }
};

export const cancelTicket = async (req, res, next) => {
    try {
        const { tid } = req.params;
        const cancelledTicket = await cancel(tid, req.user);
        res.status(200).json({ status: 'success', payload: cancelledTicket });
    } catch (error) {
        next(error);
    }
};