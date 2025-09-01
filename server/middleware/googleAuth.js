import User from "../models/User.js"; 
import generateToken from "../utils/generateToken.js";

const googleAuth = async (req, res, next) => {
  try {
    const profile = req.user?._json;
    if (!profile) {
      console.error("Google profile not found in req.user");
      return res.status(400).json({ message: "Google profile not found" });
    }

    console.log("Google Profile:", profile); // Debug log

    // Validate required fields
    if (!profile.email) {
      console.error("Email missing from Google profile");
      return res.status(400).json({ message: "Email is required from Google profile" });
    }

    // Check if user exists
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // Generate unique username
      let username = profile.email.split("@")[0];
      let counter = 1;
      
      // Check if username exists and make it unique
      while (await User.findOne({ username })) {
        username = `${profile.email.split("@")[0]}${counter}`;
        counter++;
      }

      // Create new user
      user = await User.create({
        email: profile.email,
        full_name: profile.name || profile.email.split("@")[0],
        googleId: profile.sub,
        username: username,
        profile_picture: profile.picture || '',
        bio: "Hey there! I am using Pingup",
        role: "user"
      });
      
      console.log("New user created:", user._id);
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user.googleId = profile.sub;
      if (profile.picture && !user.profile_picture) {
        user.profile_picture = profile.picture;
      }
      await user.save();
      console.log("Existing user updated with Google ID");
    }

    // Generate JWT token
    const token = generateToken(user);
    console.log("Token generated successfully");

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log("Google auth completed successfully");
    next();
  } catch (error) {
    console.error("Google Auth Error:", error);
    
    // More specific error messages
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "User with this email or username already exists" 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Internal server error during Google authentication" });
  }
};

export default googleAuth;
