import User from "../models/User.js";
import bcrypt from "bcryptjs";

const register = async (req, res, next) => {
    const { full_name, email, password } = req.body;

    try {
        // Check for empty fields
        if (!full_name || !email || !password) {
            return res.status(400).json({
                status: false,
                message: !full_name
                    ? "Name is required"
                    : !email
                    ? "Email is required"
                    : "Password is required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "This user already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-generate username from email
        let username = email.split("@")[0];

        // Ensure username is unique
        let usernameExists = await User.findOne({ username });
        let suffix = 1;
        while (usernameExists) {
            username = `${email.split("@")[0]}${suffix}`;
            usernameExists = await User.findOne({ username });
            suffix++;
        }

        // Create new user
        const newUser = new User({
            full_name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

        res.status(201).json({
            status: true,
            message: "User registered successfully",
            username // optional: return generated username
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

export default register;

