import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';

export const createTicket = async (ticketData) => {
    return await Ticket.create(ticketData);
};

export const findTicketById = async (id) => {
    return await Ticket.findById(id);
};

export const findTicketsByUser = async (userId) => {
    return await Ticket.find({ user: userId }).populate('event', 'title date location');
};

export const findTicketsByEvent = async (eventId) => {
    return await Ticket.find({ event: eventId });
};

export const findActiveTicketByUserAndEvent = async (userId, eventId) => {
    return await Ticket.findOne({ user: userId, event: eventId, status: { $ne: 'cancelled' } });
};

export const countActiveTicketsQuantity = async (eventId) => {
    const result = await Ticket.aggregate([
        {
            $match: {
                event: new mongoose.Types.ObjectId(eventId),
                status: { $ne: 'cancelled' },
            },
        },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    return result.length > 0 ? result[0].totalQuantity : 0;
};

export const updateTicketById = async (id, updateData) => {
    return await Ticket.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};