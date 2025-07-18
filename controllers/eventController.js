const Event = require('../models/event');

// GET /events - Show all events sorted by category
exports.index = (req, res) => {
    try {
        const events = Event.findAll();
        const categories = Event.findAllCategories();
        res.render('events/index', { events, categories });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { 
            message: 'Error loading events',
            error: error 
        });
    }
};

// GET /events/new - Show create event form
exports.new = (req, res) => {
    res.render('events/new');
};

// POST /events - Create new event
exports.create = (req, res) => {
    try {
        const eventData = {
            category: req.body.category,
            title: req.body.title,
            host: req.body.host,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            details: req.body.details,
            image: req.file ? `/images/${req.file.filename}` : '/images/default-event.jpg'
        };

        // validation
        if (!eventData.title || !eventData.category || !eventData.startDateTime || !eventData.endDateTime) {
            return res.status(400).render('error', {
                message: 'Missing required fields',
                error: { status: 400 }
            });
        }

        const newEvent = Event.create(eventData);
        res.redirect('/events');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Error creating event',
            error: error
        });
    }
};

// GET /events/:id - Show specific event
exports.show = (req, res) => {
    try {
        const id = req.params.id;
        const event = Event.findById(id);
        
        if (!event) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.render('events/show', { event });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Error loading event',
            error: error
        });
    }
};

// GET /events/:id/edit - Show edit event form
exports.edit = (req, res) => {
    try {
        const id = req.params.id;
        const event = Event.findById(id);
        
        if (!event) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.render('events/edit', { event });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Error loading event for editing',
            error: error
        });
    }
};

// PUT /events/:id - Update event
exports.update = (req, res) => {
    try {
        const id = req.params.id;
        const eventData = {
            category: req.body.category,
            title: req.body.title,
            host: req.body.host,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            details: req.body.details,
            image: req.file ? `/images/${req.file.filename}` : undefined
        };

        // Basic validation
        if (!eventData.title || !eventData.category || !eventData.startDateTime || !eventData.endDateTime) {
            return res.status(400).render('error', {
                message: 'Missing required fields',
                error: { status: 400 }
            });
        }

        const updatedEvent = Event.updateById(id, eventData);
        
        if (!updatedEvent) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.redirect(`/events/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Error updating event',
            error: error
        });
    }
};

// DELETE /events/:id - Delete event
exports.delete = (req, res) => {
    try {
        const id = req.params.id;
        const deletedEvent = Event.deleteById(id);
        
        if (!deletedEvent) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.redirect('/events');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Error deleting event',
            error: error
        });
    }
};