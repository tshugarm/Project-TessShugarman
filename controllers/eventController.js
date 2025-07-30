const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    next();
};

// GET /events - Show all events sorted by category
exports.index = async (req, res) => {
    try {
        const events = await Event.find();
        const categories = await Event.getCategories();
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
            location: req.body.location,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            details: req.body.details,
            image: req.file ? `/images/${req.file.filename}` : '/images/default-event.jpg',
            createdBy: req.session.userId 
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

        // Check if current user is the creator of the event
        const isCreator = req.session.userId && 
                         event.createdBy && 
                         event.createdBy._id.toString() === req.session.userId.toString();

        res.render('events/show', { event, isCreator });
    } catch (error) {
        console.error('Error loading event:', error);
        res.status(500).render('error', {
            message: 'Error loading event',
            error: error
        });
    }
};

// GET /events/:id/edit - Show edit event form
exports.edit = [requireAuth, async (req, res) => {
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

        // Check if current user is the creator of the event
        if (event.createdBy.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', {
                message: 'You can only edit your own events',
                error: { status: 403 }
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
}];

// PUT /events/:id - Update event
exports.update = [requireAuth, async (req, res) => {
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

        // Check if current user is the creator of the event
        if (event.createdBy.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', {
                message: 'You can only edit your own events',
                error: { status: 403 }
            });
        }
        
        const updateData = {
            category: req.body.category,
            title: req.body.title,
            host: req.body.host,
            location: req.body.location,
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
}];

// DELETE /events/:id - Delete event (requires authentication and ownership)
exports.delete = [requireAuth, async (req, res) => {
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

        // Check if current user is the creator of the event
        if (event.createdBy.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', {
                message: 'You can only delete your own events',
                error: { status: 403 }
            });
        }

        await Event.findByIdAndDelete(id);
        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).render('error', {
            message: 'Error deleting event',
            error: error
        });
    }
}];