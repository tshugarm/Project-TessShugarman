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

// hash the password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getFormattedStartDateTime = function() {
    return this.startDateTime.toISOString().slice(0, 16);
};

userSchema.methods.getFormattedEndDateTime = function() {
    return this.endDateTime.toISOString().slice(0, 16);
};

const userModel = mongoose.model("users", userSchema)
module.exports = userModel;

