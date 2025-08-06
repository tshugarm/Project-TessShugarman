const User = require('../models/User');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const mongoose = require('mongoose');
const validator = require('validator');

// GET /users/signup - Show registration form
exports.new = (req, res) => {
    res.render('users/signup');
};

// POST /users/signup - Register new user 
exports.create = async (req, res) => {
    try {
        // Manual validation and sanitization
        let { firstName, lastName, email, password, confirmPassword } = req.body;
        
        // Trim and escape inputs
        firstName = validator.escape(validator.trim(firstName || ''));
        lastName = validator.escape(validator.trim(lastName || ''));
        email = validator.normalizeEmail(validator.trim(email || ''));
        
        // Validation checks
        const errors = [];
        
        if (!firstName || firstName.length < 2 || firstName.length > 50) {
            errors.push('First name must be between 2 and 50 characters');
        }
        
        if (!validator.isAlpha(firstName.replace(/\s/g, ''), 'en-US')) {
            errors.push('First name can only contain letters');
        }
        
        if (!lastName || lastName.length < 2 || lastName.length > 50) {
            errors.push('Last name must be between 2 and 50 characters');
        }
        
        if (!validator.isAlpha(lastName.replace(/\s/g, ''), 'en-US')) {
            errors.push('Last name can only contain letters');
        }
        
        if (!email || !validator.isEmail(email)) {
            errors.push('Please provide a valid email address');
        }
        
        if (!password || password.length < 8 || password.length > 64) {
            errors.push('Password must be between 8 and 64 characters');
        }
        
        if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }
        
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        if (errors.length > 0) {
            return res.status(400).render('users/signup', {
                error: errors.join(', '),
                formData: { firstName, lastName, email }
            });
        }
        
        // Create new user with sanitized data
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
        
        req.flash.success(`Welcome to Campus Sports Hub, ${newUser.firstName}! Your account has been created successfully.`);
        
        res.redirect('/users/profile');
        
    } catch (error) {
        console.error('Error creating user:', error);
        
        let errorMessage = 'Error creating account';
        
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            errorMessage = errorMessages.join(', ');
        } else if (error.code === 11000) {
            errorMessage = 'An account with this email already exists';
        }
        
        res.status(400).render('users/signup', {
            error: errorMessage,
            formData: req.body
        });
    }
};

// POST /users/login - Authenticate user (WITH VALIDATION)
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        
        // Sanitize inputs
        email = validator.normalizeEmail(validator.trim(email || ''));
        
        // Validation
        if (!email || !validator.isEmail(email)) {
            return res.status(401).render('users/login', {
                error: 'Please provide a valid email address',
                formData: { email }
            });
        }
        
        if (!password) {
            return res.status(401).render('users/login', {
                error: 'Password is required',
                formData: { email }
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
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

// GET /users/login - Show login form
exports.showLogin = (req, res) => {
    res.render('users/login');
};

// GET /users/profile - Show user profile
exports.profile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
        
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/users/login');
        }
        
        const userEvents = await Event.find({ createdBy: req.session.userId })
            .sort({ createdAt: -1 });
        
        const userRsvps = await Rsvp.find({ user: req.session.userId })
            .populate({
                path: 'event',
                populate: {
                    path: 'createdBy',
                    select: 'firstName lastName'
                }
            })
            .sort({ createdAt: -1 });
        
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