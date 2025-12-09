const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");  // Use JWT for token generation


// JWT is just a digital ID card for the user.

// When a user logs in:

// Server creates a token (like a pass)
// Server gives that token to the user
// User sends that token with every request
// Server checks the token → if valid, user is allowed



// User Registration
exports.registerUser = async (req, res) =>
{
    try {
        //taken from User register form
        const { name, email, password } = req.body;

        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        
        //Save user to database : Table name is user in MongoDB
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// User Login
exports.loginUser = async (req, res) =>
{
    try {
        const { email, password } = req.body;

        // check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        

        // create JWT token
        const token = jwt.sign(
            { id: user._id },//assigning payload with user id
            process.env.JWT_SECRET,//secret key from .env file
            { expiresIn: "1h" }//valid for 1 hour
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};