const Event = require('../models/Event');
const mongoose = require('mongoose');

// GET /events - Show all events sorted by category
exports.index = (req, res) => {
    try {
        const events = Event.find();
        const categories = Event.getCategories();
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
exports.create = async (req, res) => {
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

        // Create new event in database
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        res.redirect('/events');
    } catch (error) {
        console.error('Error creating event:', error);
        
        // validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).render('error', {
                message: `Validation Error: ${errorMessages.join(', ')}`,
                error: { status: 400 }
            });
        }
        
        res.status(500).render('error', {
            message: 'Error creating event',
            error: error
        });
    }
};

// GET /events/:id - Show specific event
exports.show = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }
        
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.render('events/show', { event });
    } catch (error) {
        console.error('Error loading event:', error);
        res.status(500).render('error', {
            message: 'Error loading event',
            error: error
        });
    }
};

// GET /events/:id/edit - Show edit event form
exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }
        
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.render('events/edit', { event });
    } catch (error) {
        console.error('Error loading event for editing:', error);
        res.status(500).render('error', {
            message: 'Error loading event for editing',
            error: error
        });
    }
};

// PUT /events/:id - Update event
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }
        
        const updateData = {
            category: req.body.category,
            title: req.body.title,
            host: req.body.host,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            details: req.body.details
        };

        // Only update image if new one was uploaded
        if (req.file) {
            updateData.image = `/images/${req.file.filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validations
            }
        );
        
        if (!updatedEvent) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.redirect(`/events/${id}`);
    } catch (error) {
        console.error('Error updating event:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).render('error', {
                message: `Validation Error: ${errorMessages.join(', ')}`,
                error: { status: 400 }
            });
        }
        
        res.status(500).render('error', {
            message: 'Error updating event',
            error: error
        });
    }
};

// DELETE /events/:id - Delete event
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }
        
        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).render('error', {
            message: 'Error deleting event',
            error: error
        });
    }
};