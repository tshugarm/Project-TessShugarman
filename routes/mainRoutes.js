const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// GET / - Home page
router.get('/', mainController.index);

// GET /about - About page
router.get('/about', mainController.about);

// GET /contact - Contact page
router.get('/contact', mainController.contact);

module.exports = router;