const User = require('../models/User');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp'); // Add RSVP import
const mongoose = require('mongoose');

// GET /users/signup - Show registration form
exports.new = (req, res) => {
    res.render('users/signup');
};

// POST /users/signup - Register new user
exports.create = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).render('users/signup', {
                error: 'Passwords do not match',
                formData: { firstName, lastName, email }
            });
        }
        
        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password
        });
        
        await newUser.save();
        
        // Store user in session
        req.session.userId = newUser._id;
        req.session.user = {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
        };
        
        // Add success flash message
        req.flash.success(`Welcome to Campus Sports Hub, ${newUser.firstName}! Your account has been created successfully.`);
        
        res.redirect('/users/profile');
        
    } catch (error) {
        console.error('Error creating user:', error);
        
        let errorMessage = 'Error creating account';
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            errorMessage = errorMessages.join(', ');
        }
        // Handle duplicate email error
        else if (error.code === 11000) {
            errorMessage = 'An account with this email already exists';
        }
        
        res.status(400).render('users/signup', {
            error: errorMessage,
            formData: req.body
        });
    }
};

// GET /users/login - Show login form
exports.showLogin = (req, res) => {
    res.render('users/login');
};

// POST /users/login - Authenticate user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(401).render('users/login', {
                error: 'Invalid email or password',
                formData: { email }
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).render('users/login', {
                error: 'Invalid email or password',
                formData: { email }
            });
        }
        
        // Store user in session
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        
        // Add success flash message
        req.flash.success(`Welcome back, ${user.firstName}! You have successfully logged in.`);
        
        res.redirect('/users/profile');
        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).render('users/login', {
            error: 'An error occurred during login',
            formData: req.body
        });
    }
};

// GET /users/profile - Show user profile (UPDATED FOR RSVPs)
exports.profile = async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
        
        // Get user details
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/users/login');
        }
        
        // Get user's events
        const userEvents = await Event.find({ createdBy: req.session.userId })
            .sort({ createdAt: -1 });
        
        // Get user's RSVPs with populated event details
        const userRsvps = await Rsvp.find({ user: req.session.userId })
            .populate({
                path: 'event',
                populate: {
                    path: 'createdBy',
                    select: 'firstName lastName'
                }
            })
            .sort({ createdAt: -1 });
        
        // Filter out RSVPs where the event was deleted
        const validRsvps = userRsvps.filter(rsvp => rsvp.event !== null);
        
        res.render('users/profile', {
            user: user,
            events: userEvents,
            rsvps: validRsvps
        });
        
    } catch (error) {
        console.error('Error loading profile:', error);
        res.status(500).render('error', {
            message: 'Error loading profile',
            error: error
        });
    }
};

// POST /users/logout - Logout user
exports.logout = (req, res) => {
    // Get user name before killing session
    const firstName = req.session.user ? req.session.user.firstName : 'User';
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).render('error', {
                message: 'Error logging out',
                error: err
            });
        }
        
        res.redirect('/?logout=success');
    });
};