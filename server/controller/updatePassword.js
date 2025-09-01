import User from "../models/User.js";
import bcrypt from "bcryptjs";

const updatePassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ✅ Password hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ User ko find karo using auth middleware
    const findedUser = await User.findOne({ email: email });
    if (!findedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // ✅ Password update karo
    findedUser.password = hashedPassword;
    await findedUser.save();

    // ✅ Cookie clear karo for security
    res.clearCookie('accessToken');
    res.clearCookie('connect.sid');

    return res.status(200).json({ message: 'Password updated successfully', status: true });

  } catch (error) {
    if (!res.headersSent) {
      return res.status(error.statusCode || 500).json({ message: error.message, status: false });
    }
    console.error("Error after headers sent:", error);
  }
};

export default updatePassword;
