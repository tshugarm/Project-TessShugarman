const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireGuest } = require('../middleware/auth');

// GET /users/signup - Show registration form
router.get('/signup', requireGuest, userController.new);

// POST /users/signup - Register new user
router.post('/signup', requireGuest, userController.create);

// GET /users/login - Show login form
router.get('/login', requireGuest, userController.showLogin);

// POST /users/login - Authenticate user
router.post('/login', requireGuest, userController.login);

// GET /users/profile - Show user profile (requires authentication)
router.get('/profile', requireAuth, userController.profile);

// POST /users/logout - Logout user
router.post('/logout', requireAuth, userController.logout);

module.exports = router;