import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from  "../model/users.model.js"
import bcrypt from "bcrypt"
import { generateAccesstoken, generateRefreshtoken } from "../utils/tokens.utils.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.utils.js";

// cloudinary image upload k lye -------->>>>

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadImageToCloudinary = async (fileBuffer) => {
//   try {
//     const result = await cloudinary.uploader.upload_stream(
//       { resource_type: "auto" }, // No folder specified
//       (error, result) => {
//         if (error) {
//           console.log("Cloudinary upload failed:", error);
//           return null;
//         }
//         console.log("Uploaded Image URL:", result.secure_url);
//         return result.secure_url;
//       }
//     ).end(fileBuffer);
//   } catch (error) {
//     console.error("Error uploading to Cloudinary", error);
//     return null;
//   }
// };


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

// login User --------->>>>>>

const loginUser = async (req,res) => {
const{email,password} = req.body
if (!email) return res.status(400).json({ message: "email required" });
if (!password) return res.status(400).json({ message: "password required" });

  // email mujood ha bhi ya nahi ha
const user = await User.findOne({email})
if(!user)return res.status(404).json({messege : "user no found"})

  // password compare krwayga bcrypt 
const ispasswordValid = await bcrypt.compare(password,user.password)  
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

// get single user -------->>>>>

// const singleUser = async (req,res) =>{
// try {
//   const user = await User.findById(req.user.id).select('-password'); //ta k Password rerturn na ho
//   if (!user) {
//      res.status(400).json({message:'user not found'})
//   }
// } catch (error) {
//   res.status(500).json({message : "server ERR"})
// }
// }


// const singleUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user).select('-password');
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }

// }



const singleUser = async (req, res) => {
  try {
      console.log("Decoded User from Middleware:", req.user); // Debugging ke liye

      if (!req.user || !req.user.id) {
          return res.status(401).json({ message: "Unauthorized, no user found in token" });
      }

      const user = await User.findById(req.user.id).select('-password -publishedBlogs');
      if (!user) {
          return res.status(404).json({ message: "User not found in database" });
      }

      res.status(200).json(user);
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