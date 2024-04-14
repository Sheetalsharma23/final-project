// app.js

const express = require('express');
const cronJob = require('./cronJob');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sheetalsharmaba555:sharma@2024@cluster0.eah5s1y.mongodb.net/final-project?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// RoutesS
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

