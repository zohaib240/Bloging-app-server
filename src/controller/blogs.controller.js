import blogs from "../model/blogs.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import mongoose from "mongoose";
// cloudinary image upload k lye

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const addBlog = async(req,res) =>{
const {title,description,postedBy} = req.body

if (!title || !description || !postedBy) {
    return res.status(400).json({ error: "title,description and postedBy required" });
  }
  try {
    // Check if image is uploaded
    if (!req.file) {
        return res.status(400).json({ error: "image is required" });
      }
      const Image = req.file.path;
      console.log(Image);

//    upload image on  cloudinary and response url from cloudinary
      const blogImage = await uploadImageToCloudinary(Image);
      console.log(blogImage);

    const createBlogs = await blogs.create({
      title,
      description,
      postedBy,
      blogImage,
    });

    res.json({
      message: "blog add successfully",
      data: createBlogs,
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });

  }
}

// upload image on cloudinary  and delete in upload folder ------->>>>>

const uploadImageToCloudinary = async (localpath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });

    if (uploadResult) {
      fs.unlinkSync(localpath); // Delete local image
    }

    return uploadResult.url;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading image to Cloudinary");
  }
};


const allBlogs =async (req,res)=>{
  try {
    const allBlogs = await blogs.find()
    res.status(200).json({allBlogs})
  } catch (error) {
    console.log(error.message||error);
    res.status(500).json({
      message : "some thing went wrong"
    })
      }
}

// get single Blog

const singleBlog =async (req,res)=>{
  const {id} = req.params
  if (!mongoose.Types.ObjectId.isValid(id)){
    res.status(400).json({
      message : "invalid id"
    })
  }
  try {
    const singlePost = await blogs.findById(id)
    res.status(200).json({singlePost})
  } catch (error) {
    console.log(error.message||error);
    res.status(500).json({
      message : "some thing went wrong"
    })
      }
}

// delete Blog

const deleteBlog =async (req,res)=>{
const {id} = req.params;
if (!mongoose.Types.ObjectId.isValid(id)){
  res.status(400).json({
    message : "invalid id"
  })
}
try {
  const deleteBlog = await blogs.findByIdAndDelete(id)
  if (!deleteBlog) {
    res.status(404).json({
        message: "blog not found",
    })
  }
  res.status(200).json({
    message: "blog deleted successfully",
    status: 200,
    data: deleteBlog
});
} catch (error) {
  res.status(500).json({
    message: "Could not delete blog",
    error: error.message
})
}
}

// edit blog 

const editBlog = async (req,res) =>{
  const {id} =req.params
  if (!mongoose.Types.ObjectId.isValid(id)){
    res.status(400).json({
      message : "invalid id"
    })
  }
try {
  const updateBlog = await blogs.findByIdAndUpdate(id,{...req.body})
  if (!updateBlog) {
    res.status(404).json({
        message: "blog not found",
    })
    return
  }
  res.status(200).json({
    message : "update blog Successfully"
  })
  
} catch (error) {
  res.status(404).json({
    error : error.message
  })
}
  
}




export  {addBlog,allBlogs,deleteBlog,editBlog,singleBlog}