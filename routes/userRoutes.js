const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Accounts = require('web3-eth-accounts');
const Web3 = require('web3');
const authenticateToken = require('../utils/util')


const web3 = new Web3("https://polygon-mumbai.infura.io/v3/0f333401437149e28c3696b36eb02f93");

const router = express.Router();

// Login API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id,category : user.category, email : user.email }, 'secret-key', { expiresIn: '1h' });

        res.json({ message: 'Login successful', token, email: user.email });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error from login API' });
    }
});


// Signup API
router.post('/signup', async (req, res) => {
    const { email, password, phoneNumber , category } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const accounts = web3.eth.accounts.create();

        // Create a new user
        const newUser = await User.create({ 
            email, password: hashedPassword, 
            publicKey: accounts.address, 
            privateKey : accounts.privateKey,
            phoneNumber: phoneNumber,
            category : category
        });
        res.status(201).json({ message: 'Registration successfull' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error from signup API' });
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
    const { email } = req.query;  // Assuming you'll send email as a query parameter

    if (!email) {
        return res.status(400).json({ error: 'Email is required to fetch user profile' });
    }

    try {
        // Fetch user details
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Hide sensitive details like password and maybe others
        user.password = undefined;
        user.privateKey = undefined;

        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error from profile API' });
    }
});


router.post('/resetPassword', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and newPassword are required' });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error from resetPassword API' });
    }
});


module.exports = router;