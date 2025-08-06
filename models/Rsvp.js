const mongoose = require('mongoose');
const validator = require('validator');

console.log('Loading Rsvp model...');

const rsvpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    status: {
        type: String,
        required: [true, 'RSVP status is required'],
        enum: {
            values: ['YES', 'NO', 'MAYBE'],
            message: 'RSVP status must be YES, NO, or MAYBE'
        },
        validate: {
            validator: function(value) {
                return validator.isIn(value, ['YES', 'NO', 'MAYBE']);
            },
            message: 'Invalid RSVP status'
        }
    }
}, {
    timestamps: true
});

rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

rsvpSchema.methods.getStatus = function() {
    const statusMap = {
        YES: 'Going',
        NO: 'Not Going',
        MAYBE: 'Maybe'
    };
    return statusMap[this.status] || this.status;
};

rsvpSchema.statics.countRSVPs = async function(eventId) {
    try {
        return await this.countDocuments({ event: eventId, status: 'YES' });
    } catch (error) {
        console.error('Error counting RSVPs:', error);
        throw error;
    }
};

rsvpSchema.statics.getRSVPsByUser = async function(userId, eventId) {
    try {
        return await this.findOne({ user: userId, event: eventId });
    } catch (error) {
        console.error('Error getting RSVP by user:', error);
        throw error;
    }
};

const Rsvp = mongoose.model('Rsvp', rsvpSchema);

console.log('Rsvp model loaded successfully.');

module.exports = Rsvp;