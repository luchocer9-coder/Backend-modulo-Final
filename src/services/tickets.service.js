import crypto from 'crypto';
import {
    registerTicket,
    getTicketById,
    getTicketsByUser,
    getTicketsByEvent,
    getActiveTicketByUserAndEvent,
    getOccupiedQuantity,
    modifyTicket,
} from '../repositories/tickets.repository.js';
import { getEventById } from '../repositories/events.repository.js';
import { getUserById } from '../repositories/users.repository.js';
import { sendTicketConfirmationEmail } from '../utils/mailer.js';
import { ticketDTO } from '../dtos/ticket.dto.js';

const generateReservationCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const create = async (eventId, userId, quantity) => {
    const event = await getEventById(eventId);
    if (!event) {
        throw { status: 404, message: 'Evento no encontrado' };
    }

    if (event.status !== 'published') {
        throw { status: 400, message: 'El evento no está disponible para inscripción' };
    }

    if (event.status === 'cancelled' || event.status === 'finished') {
        throw { status: 400, message: 'No se puede inscribir a un evento cancelado o finalizado' };
    }

    const ticketQuantity = parseInt(quantity) || 1;
    if (ticketQuantity <= 0) {
        throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
    }

    const existingTicket = await getActiveTicketByUserAndEvent(userId, eventId);
    if (existingTicket) {
        throw { status: 409, message: 'Ya tenés una inscripción activa para este evento' };
    }

    const occupiedQuantity = await getOccupiedQuantity(eventId);
    const availableSpots = event.capacity - occupiedQuantity;

    if (availableSpots < ticketQuantity) {
        throw { status: 400, message: `No hay cupos suficientes. Cupos disponibles: ${availableSpots}` };
    }

    const reservationCode = generateReservationCode();

    const newTicket = await registerTicket({
        user: userId,
        event: eventId,
        quantity: ticketQuantity,
        reservationCode,
        status: 'confirmed',
    });

    const user = await getUserById(userId);
    await sendTicketConfirmationEmail(user.email, event.title, reservationCode);

    return ticketDTO(newTicket);
};

export const getMyTickets = async (userId) => {
    const tickets = await getTicketsByUser(userId);
    return tickets.map(ticketDTO);
};

export const getByEvent = async (eventId, user) => {
    const event = await getEventById(eventId);
    if (!event) {
        throw { status: 404, message: 'Evento no encontrado' };
    }

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No tenés permisos para ver las inscripciones de este evento' };
    }

    const tickets = await getTicketsByEvent(eventId);
    return tickets.map(ticketDTO);
};

export const cancel = async (ticketId, user) => {
    const ticket = await getTicketById(ticketId);

    if (!ticket) {
        throw { status: 404, message: 'Ticket no encontrado' };
    }

    const isOwner = ticket.user.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No tenés permisos para cancelar este ticket' };
    }

    if (ticket.status === 'cancelled') {
        throw { status: 400, message: 'El ticket ya está cancelado' };
    }

    const updatedTicket = await modifyTicket(ticketId, {
        status: 'cancelled',
        cancelledAt: new Date(),
    });

    return ticketDTO(updatedTicket);
};