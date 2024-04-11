const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the token in the request matches the token saved in the database
        if (user.token !== token) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        req.userId = decoded.userId;
        req.token = token; // Add the token to the request object for future use
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized - Token expired' });
        } else {
            console.error('Error verifying token:', error);
            return res.status(403).json({ message: 'Forbidden - Invalid token' });
        }
    }
}

module.exports = verifyToken;
