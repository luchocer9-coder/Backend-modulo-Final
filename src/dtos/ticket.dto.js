import { eventDTO } from './event.dto.js';

export const ticketDTO = (ticket) => {
    const isPopulated = ticket.event && typeof ticket.event === 'object' && ticket.event.title !== undefined;

    return {
        id: ticket._id,
        user: ticket.user,
        event: isPopulated ? eventDTO(ticket.event) : ticket.event,
        status: ticket.status,
        quantity: ticket.quantity,
        reservationCode: ticket.reservationCode,
        createdAt: ticket.createdAt,
        cancelledAt: ticket.cancelledAt,
    };
};