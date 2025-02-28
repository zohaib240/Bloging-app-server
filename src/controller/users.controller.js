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

    res.status(200).json({ message: "Login successful!", accessToken , user });

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
  const decodedeUser = req.user;
  console.log(decodedeUser);
  console.log("Decoded User:", req.user);  // ✅ CHECK Karo Backend Console Me
  
  try {
    if (!decodedeUser) {
      return res.status(401).json({ message: "Unauthorized, no user found in token" });
    }

    const user = await User.findById(decodedeUser.id).select('-password -publishedBlogs');
    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.status(200).json({ user }); // ✅ Wrap user in an object
    console.log("Fetched User:", user); // ✅ CHECK THIS

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Cookies se refresh token lena
    if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

    // 🔹 Token verify karein
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    // 🔹 Naya access token generate karein
    const newAccessToken = generateAccesstoken({ id: decodedToken.id, email: decodedToken.email });

    // 🔹 Naya refresh token generate karein (optional)
    const newRefreshToken = generateRefreshtoken({ id: decodedToken.id, email: decodedToken.email });

    // 🔹 Naya refresh token cookie mein save karein
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Access token generated", accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Refresh token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid refresh token" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};



export {registerUser,loginUser,singleUser,logoutUser,refreshToken}