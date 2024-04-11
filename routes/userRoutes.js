const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/verifyTokenMiddleware');
const jwt = require('jsonwebtoken');
const DeletedUser = require('../models/DeletedUser');
const mongoose = require('mongoose'); // Import Mongoose
require('dotenv').config(); // Load environment variables from .env file
const secretKey = process.env.JWT_SECRET;

// Your code using secretKey


// Register a new user
router.post('/register', async (req, res) => {
    try {
        // Check if age is a valid integer
        if (!Number.isInteger(req.body.age)) {
            return res.status(400).json({ message: 'Age should be in integer format' });
        }

        // Check if phone number is valid
        if (!(/^\d{10}$/.test(req.body.phoneNo))) {
            return res.status(400).json({ message: 'Invalid phone number format. Phone number should consist of 10 digits.' });
        }

        // Check if first name and last name have at least 3 characters
        if (req.body.firstName.length < 3 || req.body.lastName.length < 3) {
            return res.status(400).json({ message: 'First name and last name should have at least 3 characters.' });
        }

        // Check if username, phone number, and email are unique
        const existingUser = await User.findOne({
            $or: [
                { username: req.body.username },
                { phoneNo: req.body.phoneNo },
                { email: req.body.email }
            ]
        });
        if (existingUser) {
            const errors = {};
            if (existingUser.username === req.body.username) {
                errors.username = 'Username already exists';
            }
            if (existingUser.phoneNo === req.body.phoneNo) {
                errors.phoneNo = 'Phone number already exists';
            }
            if (existingUser.email === req.body.email) {
                errors.email = 'Email already exists';
            }
            return res.status(400).json({ message: 'User already exists', errors });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Encrypt sensitive data
        const algorithm = 'aes-256-cbc'; // Choosing AES-256-CBC algorithm
        const key = crypto.randomBytes(32); // Generate a secure random key
        const iv = crypto.randomBytes(16); // Generate a secure random IV (Initialization Vector)
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encryptedFirstName = cipher.update(JSON.stringify(req.body), 'utf8', 'hex');
        encryptedFirstName += cipher.final('hex');
        // let encryptedLastName = cipher.update(req.body.lastName, 'utf8', 'hex');
        // encryptedLastName += cipher.final('hex');
        // let encryptedUsername = cipher.update(req.body.username, 'utf8', 'hex');
        // encryptedUsername += cipher.final('hex');
        console.log("encryptedFirstName",encryptedFirstName);
return res.send("hello world");
        // Create a new user object with the hashed password and encrypted sensitive data
        const newUser = new User({
            username: encryptedUsername,
            password: hashedPassword,
            firstName: encryptedFirstName,
            lastName: encryptedLastName,
            nickName: req.body.nickName,
            age: req.body.age,
            email: req.body.email,
            gender: req.body.gender,
            phoneNo: req.body.phoneNo,
            fcmToken: req.body.fcmToken,
            profilePic: req.body.profilePic
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Your remaining code...

        res.status(201).json({
            userId: savedUser._id,
            registrationDate: savedUser.createdAt,
            message: 'Thank you for signing up with us'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Login user

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Check if the user has a token
        if (!user.token) {
            return res.status(401).json({ message: 'Token not found' });
        }

        // Send the user ID and token in the response
        res.status(200).json({ message: 'Welcome Back', userId: user._id, token: `Bearer ${user.token}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


 router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Access granted' });
});


router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user profile data
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Get users by ID and Age
router.get('/', verifyToken, async (req, res) => {
    const userId = req.query.userId;
    const age = req.query.age;

    try {
        if (userId && age) {
            // If both userId and age are provided, search for the user by ID and age
            const ageGroup = getAgeGroup(age); // Implement a function to determine age group
            const collectionName = `users_${ageGroup}`;
            const user = await getUserByIdAndAge(userId, age, collectionName);

            // Check if the token in the request matches the token saved in the database for the user
            if (user && user.token === req.token) {
                res.status(200).json(user);
            } else {
                res.status(401).json({ message: 'Unauthorized - Invalid token for user' });
            }
        } else if (userId) {
            // If only userId is provided, search for the user by ID
            const user = await User.findById(userId);

            // Check if the token in the request matches the token saved in the database for the user
            if (user && user.token === req.token) {
                res.status(200).json(user);
            } else {
                res.status(401).json({ message: 'Unauthorized - Invalid token for user' });
            }
        } else if (age) {
            // If only age is provided, search for users in the specified age group
            const ageGroup = getAgeGroup(age); // Implement a function to determine age group
            const collectionName = `users_${ageGroup}`;
            const users = await getUsersByAge(age, collectionName);
            res.status(200).json(users);
        } else {
            // If neither userId nor age is provided, fetch all users
            const users = await User.find();
            res.status(200).json(users);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Helper function to determine age group based on age
function getAgeGroup(age) {
    if (age >= 0 && age <= 30) {
        return 'young';
    } else if (age >= 31 && age <= 60) {
        return 'middleAge';
    } else {
        return 'old';
    }
}

// Helper function to get user by ID and Age from specific collection
async function getUserByIdAndAge(userId, age, collectionName) {
    const db = mongoose.connection;
    const ageCollection = db.collection(collectionName);
    return await ageCollection.findOne({ _id: userId, age });
}

// Helper function to get users by Age from specific collection
async function getUsersByAge(age, collectionName) {
    const db = mongoose.connection;
    const ageCollection = db.collection(collectionName);
    return await ageCollection.find({ age }).toArray();
}

// Update user by ID
router.put('/:userId', verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const loggedInUserId = req.userId;

    try {
        // Check if the user making the request is authorized to update this user
        if (userId !== loggedInUserId) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete user by ID
router.delete('/:userId', verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        // Ensure that the user making the request is authorized to delete this user
        if (req.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this user' });
        }

        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the deleted user to the DeletedUser collection
        await DeletedUser.create({
            userId: deletedUser._id,
            username: deletedUser.username,
            // Add other fields from the deleted user model if needed
        });

        // Response with deleted user information and success message
        res.status(200).json({ 
            userId: deletedUser._id, 
            registrationDate: deletedUser.createdAt, 
            userData: deletedUser,
            message: 'User account deleted successfully' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;
