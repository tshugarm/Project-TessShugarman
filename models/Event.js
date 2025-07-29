const mongoose = require('mongoose');

console.log('Loading Event model...');

const eventSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
        default: 'TBD' // Default location if not provided
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '/images/default-event.jpg'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Instance method to format start date/time for form inputs
eventSchema.methods.getFormattedStartDateTime = function() {
    return this.startDateTime.toISOString().slice(0, 16);
};

// Instance method to format end date/time for form inputs
eventSchema.methods.getFormattedEndDateTime = function() {
    return this.endDateTime.toISOString().slice(0, 16);
};

// Static method to get all distinct categories
eventSchema.statics.getCategories = async function() {
    console.log('Getting categories...');
    try {
        const categories = await this.distinct('category');
        console.log('Found categories:', categories);
        return categories.sort();
    } catch (error) {
        console.error('Error getting categories:', error);
        return ['Outdoor', 'Indoor']; // Fallback
    }
};

// Static method to find events by category
eventSchema.statics.findByCategory = async function(category) {
    return this.find({ category: category }).sort({ startDateTime: 1 });
};

// Pre-save middleware to validate dates
eventSchema.pre('save', function(next) {
    if (this.endDateTime <= this.startDateTime) {
        const error = new Error('End date must be after start date');
        error.status = 400;
        return next(error);
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);


// Debugging output
console.log('Event model created successfully');
console.log('Event.find:', typeof Event.find);
console.log('Event.getCategories:', typeof Event.getCategories);

module.exports = Event;