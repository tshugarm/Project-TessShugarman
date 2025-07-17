const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /events - Show all events
router.get('/', eventController.index);

// GET /events/new - Show create event form
router.get('/new', eventController.new);

// POST /events - Create new event
router.post('/', eventController.create);

// GET /events/:id - Show specific event
router.get('/:id', eventController.show);

// GET /events/:id/edit - Show edit event form
router.get('/:id/edit', eventController.edit);

// PUT /events/:id - Update event
router.put('/:id', eventController.update);

// DELETE /events/:id - Delete event
router.delete('/:id', eventController.delete);

module.exports = router;