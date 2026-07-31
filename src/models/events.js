export default class Event {
    constructor({ title, description, date, capacity, organizerId }) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.capacity = capacity;
        this.organizerId = organizerId;
    }
}