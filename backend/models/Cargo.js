const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    weight: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Cargo', cargoSchema);