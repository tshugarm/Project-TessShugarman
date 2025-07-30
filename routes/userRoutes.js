const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users/signup - Show registration form
router.get('/signup', userController.new);

// POST /users/signup - Register new user
router.post('/signup', userController.create);

// GET /users/login - Show login form
router.get('/login', userController.showLogin);

// POST /users/login - Authenticate user
router.post('/login', userController.login);

// GET /users/profile - Show user profile (requires authentication)
router.get('/profile', userController.profile);

// POST /users/logout - Logout user
router.post('/logout', userController.logout);

module.exports = router;