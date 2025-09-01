// import jwt from 'jsonwebtoken';

// const auth = (req, res, next) => {
//   try {
//     // const accessToken = req.cookies.accessToken;
//     const accessToken = req.cookies?.accessToken ||
//       req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"


//     if (!accessToken) {
//       return res.status(401).json({ message: 'Access token missing', status: false });
//     }

//     jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {

//       if (err) {
//         return res.status(403).json({ message: 'Unauthorized', status: false });
//       }
//       console.log(decoded);
//       // Now both userId and email are available for use in routes
//       req.userId = decoded.id;
//       req.email = decoded.email;
//       req.role = decoded.role;

      
//       next(); // ✅ only proceed if verification succeeds
//     });
//   } catch (error) {
//     if (!res.headersSent) {
//       return res.status(500).json({ message: error.message, status: false });
//     }
//     console.error("Error in auth middleware after headers sent:", error);
//   }
// };


// export default auth;


import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // ✅ Get token from cookie or Authorization header
    const accessToken = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({ message: 'Please log in to continue', status: false });
    }

    // ✅ Verify token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);

    // ✅ Check required fields
    if (!decoded?.id || !decoded?.email) {
      return res.status(401).json({ message: 'Please log in again', status: false });
    }

    // ✅ Attach user info to request
    req.userId = decoded.id;
    req.email = decoded.email;
    req.role = decoded.role;

    next(); // proceed to route
  } catch (error) {
    // Handle JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session has expired. Please log in again", status: false });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Please log in to continue", status: false });
    }

    console.error("Error in auth middleware:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again", status: false });
  }
};

export default auth;
