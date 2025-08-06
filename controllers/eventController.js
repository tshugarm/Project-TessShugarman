const Event = require('../models/Event');
const User = require('../models/User');
const Rsvp = require('../models/Rsvp');
const mongoose = require('mongoose');
const validator = require('validator');

// POST /events - Create new event (WITH VALIDATION)
exports.create = async (req, res) => {
    try {
        // Manual validation and sanitization
        let { category, title, host, location, startDateTime, endDateTime, details } = req.body;
        
        // Sanitize inputs
        title = validator.escape(validator.trim(title || ''));
        host = validator.escape(validator.trim(host || ''));
        location = validator.escape(validator.trim(location || ''));
        details = validator.escape(validator.trim(details || ''));
        
        // Validation checks
        const errors = [];
        
        if (!category || !validator.isIn(category, ['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other'])) {
            errors.push('Please select a valid category');
        }
        
        if (!title || title.length < 3 || title.length > 100) {
            errors.push('Title must be between 3 and 100 characters');
        }
        
        if (!host || host.length < 2 || host.length > 100) {
            errors.push('Host name must be between 2 and 100 characters');
        }
        
        if (!location || location.length < 3 || location.length > 200) {
            errors.push('Location must be between 3 and 200 characters');
        }
        
        if (!startDateTime || !validator.isISO8601(new Date(startDateTime).toISOString())) {
            errors.push('Please provide a valid start date and time');
        } else {
            const startDate = new Date(startDateTime);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) {
                errors.push('Start date must be today or in the future');
            }
        }
        
        if (!endDateTime || !validator.isISO8601(new Date(endDateTime).toISOString())) {
            errors.push('Please provide a valid end date and time');
        } else if (startDateTime) {
            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);
            if (endDate <= startDate) {
                errors.push('End date must be after start date');
            }
        }
        
        if (!details || details.length < 10 || details.length > 2000) {
            errors.push('Details must be between 10 and 2000 characters');
        }
        
        if (errors.length > 0) {
            req.flash.error(errors.join(', '));
            return res.redirect('/events/new');
        }

        const eventData = {
            category,
            title,
            host,
            location,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
            details,
            image: req.file ? `/images/${req.file.filename}` : '/images/default-event.jpg',
            createdBy: req.session.userId 
        };

        const newEvent = new Event(eventData);
        await newEvent.save();
        
        req.flash.success(`Event "${newEvent.title}" has been created successfully!`);
        
        res.redirect('/events');
    } catch (error) {
        console.error('Error creating event:', error);
        
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            req.flash.error(`Validation Error: ${errorMessages.join(', ')}`);
            return res.redirect('/events/new');
        }
        
        req.flash.error('Error creating event. Please try again.');
        res.redirect('/events/new');
    }
};

// POST /events/:id/rsvp - Handle RSVP request (WITH VALIDATION)
exports.rsvp = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.session.userId;
        let { status } = req.body;
        
        // Sanitize and validate status
        status = validator.trim(status || '').toUpperCase();
        
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

        // Validate RSVP status
        if (!validator.isIn(status, ['YES', 'NO', 'MAYBE'])) {
            req.flash.error('Invalid RSVP status. Must be YES, NO, or MAYBE.');
            return res.redirect(`/events/${eventId}`);
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

        console.log('Creating/updating RSVP...');

        // Use findOneAndUpdate to create or update RSVP
        const rsvp = await Rsvp.findOneAndUpdate(
            { user: userId, event: eventId },
            { 
                user: userId, 
                event: eventId, 
                status: status 
            },
            { 
                new: true, 
                upsert: true,
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
        
        req.flash.success(`You are now ${statusMessages[status]} "${event.title}".`);
        
        res.redirect(`/events/${eventId}`);

    } catch (error) {
        console.error('Error handling RSVP:', error);
        
        if (error.code === 11000) {
            req.flash.error('You have already RSVP\'d for this event.');
        } else if (error.name === 'ValidationError') {
            req.flash.error('Invalid RSVP data provided.');
        } else {
            req.flash.error('Error processing RSVP. Please try again.');
        }
        
        if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.redirect(`/events/${req.params.id}`);
        } else {
            res.redirect('/events');
        }
    }
};

// PUT /events/:id - Update event (WITH VALIDATION)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Manual validation and sanitization
        let { category, title, host, location, startDateTime, endDateTime, details } = req.body;
        
        // Sanitize inputs
        title = validator.escape(validator.trim(title || ''));
        host = validator.escape(validator.trim(host || ''));
        location = validator.escape(validator.trim(location || ''));
        details = validator.escape(validator.trim(details || ''));
        
        // Validation checks
        const errors = [];
        
        if (!category || !validator.isIn(category, ['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other'])) {
            errors.push('Please select a valid category');
        }
        
        if (!title || title.length < 3 || title.length > 100) {
            errors.push('Title must be between 3 and 100 characters');
        }
        
        if (!host || host.length < 2 || host.length > 100) {
            errors.push('Host name must be between 2 and 100 characters');
        }
        
        if (!location || location.length < 3 || location.length > 200) {
            errors.push('Location must be between 3 and 200 characters');
        }
        
        if (!startDateTime || !validator.isISO8601(new Date(startDateTime).toISOString())) {
            errors.push('Please provide a valid start date and time');
        } else {
            const startDate = new Date(startDateTime);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) {
                errors.push('Start date must be today or in the future');
            }
        }
        
        if (!endDateTime || !validator.isISO8601(new Date(endDateTime).toISOString())) {
            errors.push('Please provide a valid end date and time');
        } else if (startDateTime) {
            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);
            if (endDate <= startDate) {
                errors.push('End date must be after start date');
            }
        }
        
        if (!details || details.length < 10 || details.length > 2000) {
            errors.push('Details must be between 10 and 2000 characters');
        }
        
        if (errors.length > 0) {
            req.flash.error(errors.join(', '));
            return res.redirect(`/events/${id}/edit`);
        }
        
        const updateData = {
            category,
            title,
            host,
            location,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
            details
        };

        // Only update image if new one was uploaded
        if (req.file) {
            updateData.image = `/images/${req.file.filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true,
                runValidators: true
            }
        );

        req.flash.success(`Event "${updatedEvent.title}" has been updated successfully!`);

        res.redirect(`/events/${id}`);
    } catch (error) {
        console.error('Error updating event:', error);
        
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            req.flash.error(`Validation Error: ${errorMessages.join(', ')}`);
            return res.redirect(`/events/${req.params.id}/edit`);
        }
        
        req.flash.error('Error updating event. Please try again.');
        res.redirect(`/events/${req.params.id}/edit`);
    }
};
