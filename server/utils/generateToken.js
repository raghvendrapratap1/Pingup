import jwt from "jsonwebtoken";

const generateToken = (user) => {
  if (!user) throw new Error("User data missing for token");
  
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },  // role-based payload
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: "1d" }
  );
};


export default generateToken;
// import jwt from "jsonwebtoken";

// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "7d" });
// };

// export default generateToken;

