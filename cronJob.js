const cron = require('node-cron');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Define the cron job logic
cron.schedule('* * * * *', async () => {
    try {
        // Find all users in the database
        const users = await User.find();

        // Iterate through each user and update their token
        for (const user of users) {
            // Generate a new JWT token for the user
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3m' });

            // Update the user's token and tokenGeneratedAt in the database
            user.token = token;
            user.tokenGeneratedAt = new Date();
            await user.save();
        }

        console.log('Tokens updated for all users');
    } catch (error) {
        console.error('Error updating tokens:', error);
    }
});
