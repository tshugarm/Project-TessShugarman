const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireEventOwnership } = require('../middleware/auth');
const { validateEvent, validateRSVP } = require('../middleware/validation');

// GET /events - Show all events
router.get('/', eventController.index);

// GET /events/new - Show create event form
router.get('/new', requireAuth, eventController.new);

// POST /events - Create new event
router.post('/', requireAuth, validateEvent, eventController.create);

// GET /events/:id - Show specific event
router.get('/:id', eventController.show);

// GET /events/:id/rsvp - RSVP to an event
router.post('/:id/rsvp', requireAuth, validateRSVP, eventController.rsvp);

// GET /events/:id/edit - Show edit event form
router.get('/:id/edit', requireEventOwnership, eventController.edit);

// PUT /events/:id - Update event
router.put('/:id', requireEventOwnership, validateEvent, eventController.update);

// DELETE /events/:id - Delete event
router.delete('/:id', requireEventOwnership, eventController.delete);

module.exports = router;