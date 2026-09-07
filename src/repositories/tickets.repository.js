import {
    createTicket,
    findTicketById,
    findTicketsByUser,
    findTicketsByEvent,
    findActiveTicketByUserAndEvent,
    countActiveTicketsQuantity,
    updateTicketById,
} from '../dao/tickets.dao.js';

export const registerTicket = async (ticketData) => {
    return await createTicket(ticketData);
};

export const getTicketById = async (id) => {
    return await findTicketById(id);
};

export const getTicketsByUser = async (userId) => {
    return await findTicketsByUser(userId);
};

export const getTicketsByEvent = async (eventId) => {
    return await findTicketsByEvent(eventId);
};

export const getActiveTicketByUserAndEvent = async (userId, eventId) => {
    return await findActiveTicketByUserAndEvent(userId, eventId);
};

export const getOccupiedQuantity = async (eventId) => {
    return await countActiveTicketsQuantity(eventId);
};

export const modifyTicket = async (id, updateData) => {
    return await updateTicketById(id, updateData);
};