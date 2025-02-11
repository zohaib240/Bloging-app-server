import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from  "../model/users.model.js"
import bcrypt from "bcrypt"
import { generateAccesstoken, generateRefreshtoken } from "../utils/tokens.utils.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.utils.js";

//  register User-------->>>>>

const registerUser = async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: "Profile image is required" });
  }

  if (!userName || !fullName || !email || !password) {
    return res.status(400).json({ error: "Email or password missing" });
  }
  
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({ message: "User already exists" });
    }
    const profilePicture = await uploadImageToCloudinary(req.file.buffer);
    console.log(profilePicture);
    
    const createUser = await User.create({
      userName,
      fullName,
      email,
      password,
      profilePicture,
    });
    res.json({
      message: "User registered successfully",
      data: createUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email) return res.status(400).json({ message: "email required" });
//   if (!password) return res.status(400).json({ message: "password required" });

//   try {
//       // Check if user exists
//       const user = await User.findOne({ email });
//       if (!user) return res.status(404).json({ message: "user not found" });

//       // Compare password using bcrypt
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) return res.status(401).json({ message: "incorrect password" });

//       // Generate tokens
//       const accessToken = generateAccesstoken(user);
//       const refreshToken = generateRefreshtoken(user);

//       // Set refresh token in cookie
//       res
//           .cookie("refreshToken", refreshToken, { 
//               httpOnly: true, 
//               secure: process.env.NODE_ENV === 'production', 
//               maxAge: 24 * 60 * 60 * 1000 
//           })
//           .status(200)
//           .json({
//               message: "User successfully logged in!",
//               data: user,
//               tokens: {
//                   accessToken,
//                   refreshToken
//               }
//           });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "An error occurred during login" });
//   }
// };

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Incorrect password" });

    const accessToken = generateAccesstoken(user);
    const refreshToken = generateRefreshtoken(user);

    // ✅ Refresh token ko httpOnly cookie me save karo
    res.cookie("accessToken",accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Login successful!", accessToken });

  } catch (error) {
    res.status(500).json({ message: "An error occurred during login" });
  }
};


// logout user --------->>>>>

const logoutUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "Strict" // Secure cookie policy
  });
  res.json({ message: "Logout successful." });
};

// get singleUser ------->>>>>

const singleUser = async (req, res) => {
  const decodedeUser = req.user
  console.log(decodedeUser);
  
  try {
      if (!decodedeUser) {
          return res.status(401).json({ message: "Unauthorized, no user found in token" });
      }

      const user = await User.findById(decodedeUser.id).select('-password -publishedBlogs');
      if (!user) {
          return res.status(404).json({ message: "User not found in database" });
      }

      res.status(200).json(user);
      return
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};


// refreresh Token ------->>>>>>>>

const refreshToken = async (req,res)=>{
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken
  console.log("Cookies:", req.cookies); // Debug cookies
  console.log("Body:", req.body); 
  
  if(!refreshToken)
  return res.status(404).json({
    messege : "no token found"
  })
  
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  
  const user = await User.findOne({email : decodedToken.email})
  
  if (!user) return res.status(404).json({ message: "invalid token" });
  
  const generateToken = generateAccesstoken(user)
  res.json({ message: "access token generated", accesstoken: generateToken ,decodedToken});
  
  }


export {registerUser,loginUser,singleUser,logoutUser,refreshToken}