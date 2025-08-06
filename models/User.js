const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

console.log('Loading User model...');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters'],
        trim: true,
        validate: {
            validator: function(value) {
                return validator.isAlpha(value.replace(/\s/g, ''), 'en-US');
            },
            message: 'First name must contain only letters'
        }
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters'],
        trim: true,
        validate: {
            validator: function(value) {
                return validator.isAlpha(value.replace(/\s/g, ''), 'en-US');
            },
            message: 'Last name must contain only letters'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters'],
        maxLength: [64, 'Password cannot exceed 64 characters'],
        validate: {
            validator: function(value) {
                // Password must contain at least one uppercase, one lowercase, and one number
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = 15;
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.set('toJSON', {
    virtuals: true
});

const User = mongoose.model('User', userSchema);

console.log('User model created successfully');

module.exports = User;