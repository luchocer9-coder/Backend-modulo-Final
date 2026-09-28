import Event from '../models/Event.js';

export const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

export const findEventById = async (id) => {
    return await Event.findById(id);
};

export const findEvents = async (filter, options) => {
    const { page, limit, sort } = options;
    const skip = (page - 1) * limit;

    const events = await Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Event.countDocuments(filter);

    return { events, total };
};

export const updateEventById = async (id, updateData) => {
    return await Event.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};