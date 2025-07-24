const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventSchema = new mongoose.Schema({
    eventId: {
        type: Number,
        unique: true
    },
    category: String,
    title: String,
    host: String,
    startDateTime: Date,
    endDateTime: Date,
    details: String,
    image: String
});

eventSchema.plugin(AutoIncrement, { inc_field: 'eventId' });

const eventModel = mongoose.model('events', eventSchema);
module.exports = eventModel;
