// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickName: String,
    age: { type: Number, required: true },
    email: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phoneNo: { type: Number },
    fcmToken: String,
    profilePic: String,
    createdAt: { type: Date, default: Date.now },
    token: { type: String },
    tokenGeneratedAt: { type: Date }

});

module.exports = mongoose.model('User', userSchema);
