const User = require('../models/User');
const Event = require('../models/Event');

// Check if user is authenticated 
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        req.flash.error('You must be logged in to access this page.');
        return req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            res.redirect('/users/login');
        });
    }
    next();
};

// Check if user is a guest 
const requireGuest = (req, res, next) => {
    if (req.session.userId) {
        req.flash.warning('You are already logged in.');
        return req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            res.redirect('/users/profile');
        });
    }
    next();
};
// Check if user owns the event   aka (isAuthor)
const requireEventOwnership = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.session.userId;

        // First check if user is authenticated
        if (!userId) {
            req.flash.error('You must be logged in to access this page.');
            return res.redirect('/users/login');
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).render('error', {
                message: 'Event not found',
                error: { status: 404 }
            });
        }

        // Check ownership
        if (event.createdBy.toString() !== userId.toString()) {
            req.flash.error('You can only modify your own events.');
            return res.redirect('/events');
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).render('error', {
            message: 'Authorization check failed',
            error: error
        });
    }
};

// Populate user data for authenticated users
// Validates ID
const populateUser = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                res.locals.user = {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.getFullName()
                };
                res.locals.isLoggedIn = true;
            } else {
                // User not found, clear session
                req.session.destroy();
                res.locals.isLoggedIn = false;
                res.locals.user = null;
            }
        } catch (error) {
            console.error('Error populating user:', error);
            res.locals.isLoggedIn = false;
            res.locals.user = null;
        }
    } else {
        res.locals.isLoggedIn = false;
        res.locals.user = null;
    }
    next();
};

module.exports = {
    requireAuth,
    requireGuest,
    requireEventOwnership,
    populateUser
};