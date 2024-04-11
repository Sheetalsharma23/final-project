// models/DeletedUser.js

const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
    // Define the schema fields similar to the User model if needed
    // Example:
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    // Add other fields as needed
    // Example:
    username: {
        type: String,
        required: true
    },
    // Additional fields from the User model can be added here
}, { timestamps: true });

const DeletedUser = mongoose.model('DeletedUser', deletedUserSchema);

module.exports = DeletedUser;
