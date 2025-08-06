const mongoose = require('mongoose');

console.log('Loading Rsvp model...');

const rsvpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['YES', 'NO', 'MAYBE'],
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