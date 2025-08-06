const Event = require('../models/Event');
const User = require('../models/User');
const Rsvp = require('../models/Rsvp');
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

        // Get RSVP count for this event
        const rsvpCount = await Rsvp.countRSVPs(id);

        // Get current user's RSVP status if logged in and not creator
        let userRsvp = null;
        if (req.session.userId && !isCreator) {
            userRsvp = await Rsvp.getRSVPsByUser(req.session.userId, id);
        }

        res.render('events/show', { 
            event, 
            isCreator, 
            rsvpCount, 
            userRsvp 
        });
    } catch (error) {
        console.error('Error loading event:', error);
        res.status(500).render('error', {
            message: 'Error loading event',
            error: error
        });
    }
};

// POST /events/:id/rsvp - Handle RSVP request
exports.rsvp = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.session.userId;
        const status = req.body.status;

        console.log('RSVP attempt:', { eventId, userId, status });

        // Check if user is logged in
        if (!userId) {
            req.flash.error('You must be logged in to RSVP for events.');
            return res.redirect('/users/login');
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(404).render('error', {
                message: 'Invalid event ID',
                error: { status: 404 }
            });
        }

        // Validate event exists and get event details
        const event = await Event.findById(eventId).populate('createdBy');
        
        if (!event) {
            console.log('Event not found:', eventId);
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        console.log('Event found:', event.title, 'Creator:', event.createdBy);

        // Check if event has a creator (additional safety check)
        if (!event.createdBy) {
            console.error('Event has no creator:', eventId);
            return res.status(500).render('error', {
                message: 'Event data is corrupted - missing creator',
                error: { status: 500 }
            });
        }

        // Check if user is the host of the event
        if (event.createdBy._id.toString() === userId.toString()) {
            req.flash.error('You cannot RSVP for your own event.');
            return res.redirect(`/events/${eventId}`);
        }

        // Validate status (validation middleware should handle this, but double-check)
        if (!status || !['YES', 'NO', 'MAYBE'].includes(status.toUpperCase())) {
            req.flash.error('Invalid RSVP status.');
            return res.redirect(`/events/${eventId}`);
        }

        console.log('Creating/updating RSVP...');

        // Use findOneAndUpdate to create or update RSVP
        const rsvp = await Rsvp.findOneAndUpdate(
            { user: userId, event: eventId },
            { 
                user: userId, 
                event: eventId, 
                status: status.toUpperCase() 
            },
            { 
                new: true, 
                upsert: true, // Create if doesn't exist
                runValidators: true 
            }
        );

        console.log('RSVP created/updated:', rsvp);

        // Set appropriate flash message
        const statusMessages = {
            'YES': 'going to',
            'NO': 'not going to',
            'MAYBE': 'might go to'
        };
        
        req.flash.success(`You are now ${statusMessages[status.toUpperCase()]} "${event.title}".`);
        
        res.redirect(`/events/${eventId}`);

    } catch (error) {
        console.error('Error handling RSVP:', error);
        
        if (error.code === 11000) {
            // Duplicate key error (shouldn't happen with findOneAndUpdate, but just in case)
            req.flash.error('You have already RSVP\'d for this event.');
        } else if (error.name === 'ValidationError') {
            req.flash.error('Invalid RSVP data provided.');
        } else {
            req.flash.error('Error processing RSVP. Please try again.');
        }
        
        // If we have a valid eventId, redirect there, otherwise to events list
        if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.redirect(`/events/${req.params.id}`);
        } else {
            res.redirect('/events');
        }
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

// DELETE /events/:id - Delete event (OWNERSHIP REQUIRED) - UPDATED FOR RSVP CLEANUP
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        const eventTitle = event ? event.title : 'Event';
        
        // Delete all RSVPs associated with this event first
        await Rsvp.deleteMany({ event: id });
        
        // Then delete the event
        await Event.findByIdAndDelete(id);
        
        // Add success flash message
        req.flash.success(`Event "${eventTitle}" and its associated RSVPs have been deleted successfully.`);
        
        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        req.flash.error('Error deleting event. Please try again.');
        res.redirect('/events');
    }
};