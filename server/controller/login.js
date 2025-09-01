import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";


const login = async (req, res, next) => {
  const { email, password } = req.body;

  console.log("🔐 Login attempt for email:", email);
  console.log("📝 Request body:", req.body);

  // Validate required fields
  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({
      message: 'Email and password are required',
      status: false
    });
  }

  try {
    // Check database connection status
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error("❌ Database not connected. ReadyState:", mongoose.default.connection.readyState);
      return res.status(500).json({
        message: 'Database connection error',
        status: false
      });
    }

    console.log("✅ Database connection verified");

    // Try to find the user
    console.log("🔍 Searching for user with email:", email);
    const findedUser = await User.findOne({ email: email });
    
    if (!findedUser) {
      console.log("❌ No user found with email:", email);
      
      // Let's also check if there are any users in the database
      const totalUsers = await User.countDocuments();
      console.log("📊 Total users in database:", totalUsers);
      
      // Check if the email format matches what's stored
      const allUsers = await User.find({}, 'email');
      console.log("📧 All user emails in database:", allUsers.map(u => u.email));
      
      return res.status(400).json({
        message: 'No user found with this email',
        status: false
      });
    }

    console.log("✅ User found:", findedUser._id);
    console.log("👤 User details:", {
      id: findedUser._id,
      email: findedUser.email,
      full_name: findedUser.full_name,
      hasPassword: !!findedUser.password
    });

    // Check if user has a password (for Google users who might not have passwords)
    if (!findedUser.password) {
      console.log("❌ User has no password set (possibly Google user)");
      return res.status(400).json({
        message: 'This account was created with Google. Please use Google login.',
        status: false
      });
    }

    const isPassMatch = await bcrypt.compare(password, findedUser.password);
    if (!isPassMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(400).json({
        message: "Incorrect password",
        status: false
      });
    }

    console.log("✅ Password verified for user:", email);

    // Check if ACCESS_TOKEN_KEY exists
    if (!process.env.ACCESS_TOKEN_KEY) {
      console.error("❌ ACCESS_TOKEN_KEY environment variable is missing!");
      return res.status(500).json({
        message: 'Server configuration error',
        status: false
      });
    }

    // ✅ Generate token using updated generateToken
    const accessToken = generateToken(findedUser); // pass full user object
    console.log("✅ Token generated successfully");
    
    // Save token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,   // localhost ke liye
      sameSite: 'lax'  // ya remove kar do
    });

    console.log("✅ Cookie set successfully");

    res.status(200).json({
      message: 'Login successful',
      status: true,
      user: {
        id: findedUser._id,
        email: findedUser.email,
        full_name: findedUser.full_name
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    console.error("❌ Error stack:", error.stack);
    next(error);
  }
};

export default login;

