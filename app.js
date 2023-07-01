const express = require('express');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const crypto = require('crypto');

const secretKey = crypto.randomBytes(8).toString('hex');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Mock user data
const users = [
    { "username": "evans", "password": "12345 "},
    { "username": "karani", "password": "11122" }
];

// Sign-up route
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Save user data and OTP
    users.push({ username, password, otp });

    return res.status(200).json({ message: 'Sign up successful. OTP generated.' });
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Update the user's OTP
    user.otp = otp;

    // Generate JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    // Set JWT token as HTTP-only cookie
    res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({ message: 'Login successful. OTP generated and token sent.' });
});

app.get("/api/users", (req, res) => {
    res.send(users)
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
