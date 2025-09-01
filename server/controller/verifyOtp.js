// import User from "../models/User.js";
// import generateToken from "../utils/generateToken.js";

// const verifyOtp = async (req, res, next) => {

//     const{otp}=req.body;

//     console.log("req.body =>", req.body);


//     console.log(otp);

//     try {
//         const findedUser = await User.findOne({ 'password_otp.otp': otp });

//         if (!findedUser) {
//             const error = new Error('Incorrect OTP');
//             error.statusCode = 400;
//             throw error;
//         }

//         // 5 minutes expiry
//         const expiryTime = new Date(findedUser.password_otp.send_time).getTime() + 5 * 60 * 1000;  
//         const now = Date.now();

//         if (now > expiryTime) {
//             const error = new Error('OTP expired');
//             error.statusCode = 400;
//             throw error;
//         }

//        console.log("OTP verified hit ✅");
//         // res.status(200).json({ message: 'OTP verified', status: true });

//         // findedUser.password_otp.otp  = null
//         // await findedUser.save();

//         // const accessToken=generateToken(findedUser.email);
//         // res.cookie('accessToken',accessToken)

//         // NEW (fixed order)
// const accessToken = generateToken(findedUser.email);
// res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax' }); // ✅ cookie set pehle

// findedUser.password_otp.otp  = null;
// await findedUser.save();

// return res.status(200).json({ message: 'OTP verified', status: true }); // ✅ response last



//     } catch (error) {
//         next(error);
//     }
// };

// export default verifyOtp;


import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const verifyOtp = async (req, res, next) => {
    const { otp } = req.body;

    console.log("req.body =>", req.body);

    if (!otp) {
        return res.status(400).json({ message: "Please enter the OTP code", status: false });
    }

    try {
        // OTP ke basis pe user dhundo
        const findedUser = await User.findOne({ 'password_otp.otp': otp });

        if (!findedUser) {
            console.log("No user found with this OTP");
            return res.status(400).json({ message: 'Invalid OTP code. Please try again', status: false });
        }

        console.log("findedUser =>", findedUser);

        // Check karo ki password_otp exist karta hai ya nahi
        if (!findedUser.password_otp) {
            console.log("password_otp is missing for this user");
            return res.status(500).json({ message: 'Something went wrong. Please try again', status: false });
        }

        // OTP expiry check (5 minutes)
        const expiryTime = new Date(findedUser.password_otp.send_time).getTime() + 5 * 60 * 1000;  
        const now = Date.now();

        if (now > expiryTime) {
            console.log("OTP expired");
            return res.status(400).json({ message: 'OTP code has expired. Please request a new one', status: false });
        }

        console.log("OTP verified hit ✅");

        // Safe token generation
        let emailForToken = findedUser.email;
        if (!emailForToken) {
            console.log("Email missing, using user _id for token");
            emailForToken = findedUser._id.toString();
        }

        const accessToken = generateToken(emailForToken);

        // Set cookie
        try {
            res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax' });
        } catch (cookieError) {
            console.error("Cookie setting failed:", cookieError);
        }

        // Clear OTP safely
        if (findedUser.password_otp.otp) {
            findedUser.password_otp.otp = null;
            try {
                await findedUser.save();
            } catch (saveError) {
                console.error("Saving user OTP clear failed:", saveError);
            }
        }

        // ✅ Response last
        return res.status(200).json({ 
            message: 'OTP verified', 
            status: true,
            user: {
                _id: findedUser._id,
                email: findedUser.email
            }
        });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        next(error);
    }
};

export default verifyOtp;
