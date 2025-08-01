const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /events - Show all events sorted by category
exports.index = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'firstName lastName');
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

// GET /events/new - Show create event form (AUTH REQUIRED)
exports.new = (req, res) => {
    res.render('events/new');
};

// POST /events - Create new event (AUTH REQUIRED)
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
        
        // Add success flash message
        req.flash.success(`Event "${newEvent.title}" has been created successfully!`);
        
        res.redirect('/events');
    } catch (error) {
        console.error('Error creating event:', error);
        
        // validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            req.flash.error(`Validation Error: ${errorMessages.join(', ')}`);
            return res.redirect('/events/new');
        }
        
        req.flash.error('Error creating event. Please try again.');
        res.redirect('/events/new');
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
        
        const event = await Event.findById(id).populate('createdBy', 'firstName lastName');
        
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

// GET /events/:id/edit - Show edit event form (OWNERSHIP REQUIRED)
exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
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

// PUT /events/:id - Update event (OWNERSHIP REQUIRED)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        
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

        // Add success flash message
        req.flash.success(`Event "${updatedEvent.title}" has been updated successfully!`);

        res.redirect(`/events/${id}`);
    } catch (error) {
        console.error('Error updating event:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            req.flash.error(`Validation Error: ${errorMessages.join(', ')}`);
            return res.redirect(`/events/${req.params.id}/edit`);
        }
        
        req.flash.error('Error updating event. Please try again.');
        res.redirect(`/events/${req.params.id}/edit`);
    }
};

// DELETE /events/:id - Delete event (OWNERSHIP REQUIRED)
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        const eventTitle = event ? event.title : 'Event';
        
        await Event.findByIdAndDelete(id);
        
        // Add success flash message
        req.flash.success(`Event "${eventTitle}" has been deleted successfully.`);
        
        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        req.flash.error('Error deleting event. Please try again.');
        res.redirect('/events');
    }
};