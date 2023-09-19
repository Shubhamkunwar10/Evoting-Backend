const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Accounts = require('web3-eth-accounts');
const { Web3 } = require("web3");

const web3 = new Web3(
    new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/0f333401437149e28c3696b36eb02f93")
);

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
        const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
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
        console.log(accounts);
        // Create a new user
        const newUser = await User.create({ 
            email, password: hashedPassword, 
            publicKey: accounts.address, 
            phoneNumber: phoneNumber,
            category : category
        });
        res.status(201).json({ message: 'Registration successfull' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error from signup API' });
    }
});


module.exports = router;