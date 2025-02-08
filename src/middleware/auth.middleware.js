
import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  // Step 1: Get the token from headers
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(404).json({ message: "No token found" });
  }

  // Step 2: Remove 'Bearer ' part from the token
  const tokenWithoutBearer = token.split(" ")[1];

  if (!tokenWithoutBearer) {
    return res.status(403).json({ message: "Token format is incorrect" });
  }

  // Step 3: Verify the token using the secret
  jwt.verify(tokenWithoutBearer, process.env.ACCESS_JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error in token verification:", err);  // Log the error for debugging
      return res.status(403).json({ message: "Invalid token" });
    }

    // Step 4: Attach the user data to the request object
    req.user = user;
    next();  // Proceed to the next middleware or route handler
  });
};

export default authenticateUser;








// import jwt from "jsonwebtoken";

// const authenticateUser =async (req,res,next)=>{
//     const token = req.headers["authorization"];
//     if (!token) return res.status(404).json({ message: "no token found" });
// jwt.verify(token,process.env.ACCESS_JWT_SECRET,(err,user) => {
//     if (err) return res.status(403).json({ message: "invalid token" });
//    req.user = user
//    next()
// })

// }

// export default authenticateUser



// import jwt from "jsonwebtoken";
// import User from "../models/users.models.js"

// const autenticateUser = async (req, res, next) => {
//     const accessToken = req.headers["authorization"]?.split(' ')[1];
//     const currentRefreshToken = req.cookies?.refreshToken;
//     if (!accessToken) return res.status(401).json({
//         message: "No access token recieved!"
//     })
//     try {
//         const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//         req.user = decoded;
//         next()
//     } catch (error) {
//         console.log(error.message || error);
//         if (error.message === "jwt malformed") {
//             return res.status(400).json({
//                 message: "The provided token is malformed!"
//             })
//         }
//         if (error.message === "jwt expired") {
//             if (!currentRefreshToken) {
//                 return res.status(401).json({
//                     message: "Refresh token not found, Please login again!"
//                 })
//             }
//             //check if token is valid
//             try {
//                 const decoded = jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_SECRET)
//                 //check if the user exists in DB
//                 const user = await User.findById(decoded._id);
//                 if (!user) {
//                     return res.status(404).json({
//                         message: "User not found!"
//                     })
//                 }
//                 //generate new tokens if user found
//                 const {accessToken,refreshToken} =ge(user);
//                 res
//                 //Adding cookies
//                 .cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 })
//                 req.tokens = { accessToken };
//                 req.user = user;
//                 next()
//             } catch (error) {
//                 console.log(error.message || error);
//                 if (error.message === "jwt malformed") {
//                     return res.status(400).json({
//                         message: "Refresh token is malformed!"
//                     })
//                 }
//                 if (error.message === "jwt expired") {
//                     return res.status(400).json({
//                         message: "Refresh token is expired!"
//                     })
//                 }
//                 return res.status(500).json({
//                     message: "Something went wrong while authenticating!"
//                 })
//             }
//         }
//     }
// }

// export { autenticateUser }



















