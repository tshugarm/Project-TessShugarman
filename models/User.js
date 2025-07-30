const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

console.log('Loading User model...');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
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