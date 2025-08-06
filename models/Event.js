const mongoose = require('mongoose');
const validator = require('validator');

console.log('Loading Event model...');

const eventSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other'],
            message: 'Category must be one of: Outdoor, Indoor, Water Sports, Winter Sports, Other'
        },
        validate: {
            validator: function(value) {
                return validator.isIn(value, ['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other']);
            },
            message: 'Invalid category selected'
        }
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minLength: [3, 'Title must be at least 3 characters'],
        maxLength: [100, 'Title cannot exceed 100 characters'],
        validate: {
            validator: function(value) {
                // Escape HTML to prevent XSS
                return validator.escape(value) !== '';
            },
            message: 'Title contains invalid characters'
        }
    },
    host: {
        type: String,
        required: [true, 'Host name is required'],
        trim: true,
        minLength: [2, 'Host name must be at least 2 characters'],
        maxLength: [100, 'Host name cannot exceed 100 characters'] 
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        minLength: [3, 'Location must be at least 3 characters'],
        maxLength: [200, 'Location cannot exceed 200 characters'],
        default: 'TBD'
    },
    startDateTime: {
        type: Date,
        required: [true, 'Start date and time is required'],
        validate: {
            validator: function(value) {
                // Check if it's a valid ISO 8601 date and after today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: 'Start date must be today or in the future'
        }
    },
    endDateTime: {
        type: Date,
        required: [true, 'End date and time is required'],
        validate: {
            validator: function(value) {
                // Check if it's a valid ISO 8601 date
                if (!validator.isISO8601(value.toISOString())) {
                    return false;
                }
                // Check if end date is after start date
                return this.startDateTime && value > this.startDateTime;
            },
            message: 'End date must be after start date'
        }
    },
    details: {
        type: String,
        required: [true, 'Event details are required'],
        trim: true,
        minLength: [10, 'Details must be at least 10 characters'],
        maxLength: [2000, 'Details cannot exceed 2000 characters']
    },
    image: {
        type: String,
        default: '/images/default-event.jpg',
        validate: {
            validator: function(value) {
                // Allow default image or valid URL paths
                return value === '/images/default-event.jpg' || 
                       validator.isURL(value, { protocols: ['http', 'https'], require_protocol: false }) ||
                       /^\/images\//.test(value);
            },
            message: 'Invalid image path'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    }
}, {
    timestamps: true 
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

module.exports = Event;