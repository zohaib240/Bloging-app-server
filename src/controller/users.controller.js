import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from  "../model/users.model.js"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { generateAccesstoken, generateRefreshtoken } from "../utils/tokens.utils.js";

// cloudinary image upload k lye -------->>>>

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

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

    // Check if image is uploaded
    const profileImage = req.file.path;
    console.log(profileImage);

    const profilePicture = await uploadImageToCloudinary(profileImage);
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

// login User --------->>>>>>

const loginUser = async (req,res) => {
const{email,password} = req.body
if (!email) return res.status(400).json({ message: "email required" });
if (!password) return res.status(400).json({ message: "password required" });

  // email mujood ha bhi ya nahi ha
const user = await User.findOne({email})
if(!user)return res.status(404).json({messege : "user no found"})

  // password compare krwayga bcrypt 
const ispasswordValid = bcrypt.compare(password,user.password)  
if(!ispasswordValid) return res.status().json({messege : "incorrect password"})

// token generate
const accessToken =generateAccesstoken(user)
const refreshToken =generateRefreshtoken(user)

res.cookie("refreshToken", refreshToken ,  { http: true, secure: false })
res.json({
message : "login successfully",
accessToken,
refreshToken,
data : user 
})
}


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

// upload image on cloudinary  and delete in upload folder ------->>>>>



// Upload Image to Cloudinary (and delete local file from uploads folder)
const uploadImageToCloudinary = async (localpath) => {
  try {
    // Upload image to Cloudinary directly from the localpath
    const uploadResult = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto", // Automatically detects the resource type
    });

    // Log the result for debugging
    console.log("Upload result:", uploadResult);

    // After successful upload, delete the local file (Only for local dev server, Vercel doesn't need this)
    fs.unlinkSync(localpath); // Delete local file after upload

    // Return the Cloudinary URL
    return uploadResult.url;

  } catch (error) {
    console.log("Error uploading image to Cloudinary:", error);
    throw new Error("Error uploading image to Cloudinary");
  }
};



// const uploadImageToCloudinary = async (localpath) => {
//   console.log(localpath);
//   try {
//     const uploadResult = await cloudinary.uploader.upload(localpath, {
//       resource_type: "auto",
//     });

//     console.log(uploadResult);

//     if (uploadResult) {
//       fs.unlinkSync(localpath); // Delete local image
//     }

//     return uploadResult.url;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Error uploading image to Cloudinary");
//   }
// };


export {registerUser,loginUser,logoutUser,refreshToken}