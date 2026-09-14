import { registerEvent, getEventById, getEvents, modifyEvent } from '../repositories/events.repository.js';
import { eventDTO } from '../dtos/event.dto.js';

const VALID_STATUSES = ['draft', 'published', 'cancelled', 'finished'];

export const create = async (eventData, organizerId) => {
    const { title, description, category, date, location, capacity, price } = eventData;

    if (!title || !description || !category || !location) {
        throw { status: 400, message: 'Faltan campos obligatorios' };
    }

    if (!date || isNaN(new Date(date).getTime())) {
        throw { status: 400, message: 'La fecha es inválida' };
    }

    if (new Date(date) < new Date()) {
        throw { status: 400, message: 'No se puede crear un evento con fecha pasada' };
    }

    if (!capacity || capacity <= 0) {
        throw { status: 400, message: 'La capacidad debe ser mayor a 0' };
    }

    if (price !== undefined && price < 0) {
        throw { status: 400, message: 'El precio no puede ser negativo' };
    }

    const newEvent = await registerEvent({
        title,
        description,
        category,
        date,
        location,
        capacity,
        price: price || 0,
        organizer: organizerId,
    });

    return eventDTO(newEvent);
};

export const getAll = async (queryParams) => {
    const { status, category, location, dateFrom, dateTo, page = 1, limit = 10, sort } = queryParams;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;

    if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) filter.date.$gte = new Date(dateFrom);
        if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const sortOption = {};
    if (sort) {
        const field = sort.startsWith('-') ? sort.slice(1) : sort;
        const direction = sort.startsWith('-') ? -1 : 1;
        sortOption[field] = direction;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const { events, total } = await getEvents(filter, {
        page: pageNumber,
        limit: limitNumber,
        sort: sortOption,
    });

    return {
        data: events.map(eventDTO),
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
    };
};

export const getById = async (id) => {
    const event = await getEventById(id);
    if (!event) {
        throw { status: 404, message: 'Evento no encontrado' };
    }
    return eventDTO(event);
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

    if (event.status === 'cancelled') {
        throw { status: 400, message: 'No se puede modificar un evento cancelado' };
    }

    if (updateData.capacity !== undefined && updateData.capacity <= 0) {
        throw { status: 400, message: 'La capacidad debe ser mayor a 0' };
    }

    if (updateData.price !== undefined && updateData.price < 0) {
        throw { status: 400, message: 'El precio no puede ser negativo' };
    }

    const updatedEvent = await modifyEvent(eventId, updateData);
    return eventDTO(updatedEvent);
};

export const updateStatus = async (eventId, newStatus, user) => {
    const event = await getEventById(eventId);

    if (!event) {
        throw { status: 404, message: 'Evento no encontrado' };
    }

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No tenés permisos para modificar este evento' };
    }

    if (!VALID_STATUSES.includes(newStatus)) {
        throw { status: 400, message: 'Estado inválido' };
    }

    if (event.status === 'cancelled') {
        throw { status: 400, message: 'No se puede cambiar el estado de un evento cancelado' };
    }

    if (newStatus === 'published' && (event.status === 'finished' || event.status === 'cancelled')) {
        throw { status: 400, message: 'No se puede publicar un evento finalizado o cancelado' };
    }

    const updatedEvent = await modifyEvent(eventId, { status: newStatus });
    return eventDTO(updatedEvent);
};