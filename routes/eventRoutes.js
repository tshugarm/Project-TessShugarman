const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireEventOwnership } = require('../middleware/auth');

// GET /events - Show all events
router.get('/', eventController.index);

// GET /events/new - Show create event form
router.get('/new', requireAuth, eventController.new);

// POST /events - Create new event
router.post('/', requireAuth, eventController.create);

// GET /events/:id - Show specific event
router.get('/:id', eventController.show);

// GET /events/:id/edit - Show edit event form
router.get('/:id/edit', requireEventOwnership, eventController.edit);

// PUT /events/:id - Update event
router.put('/:id', requireEventOwnership, eventController.update);

// DELETE /events/:id - Delete event
router.delete('/:id', requireEventOwnership, eventController.delete);

module.exports = router;