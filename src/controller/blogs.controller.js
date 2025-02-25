import blogs from "../model/blogs.model.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../utils/cloudinary.utils.js";
 
// post blog ------>>>>>

const addBlog = async(req,res) =>{
const {title,description,postedBy} = req.body

if (!title || !description || !postedBy) {
    return res.status(400).json({ error: "title,description and postedBy required" });
  }
  try {


//    upload image on  cloudinary and response url from cloudinary

const blogPicture = await uploadImageToCloudinary(req.file.buffer);
console.log( 'blog picture' , blogPicture);

    const createBlogs = await blogs.create({
      title,
      description,
      postedBy,
      blogPicture : blogPicture
    });

    res.json({
      message: "blog add successfully",
      data: createBlogs,
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// get all blogs  ----->>>>

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

// get single Blog ----->>>


const singleuserBlogs = async (req, res) => {
  const { id } = req.params; // ✅ yaha 'id' actually user ka _id hoga
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    // ✅ Ab ek blog nahi, balki user ke saare blogs fetch honge
    const userBlogs = await blogs.find({ postedBy: id });

    if (!userBlogs.length) {
      return res.status(404).json({ message: "No blogs found for this user" });
    }

    res.status(200).json(userBlogs);
  } catch (error) {
    console.log(error.message || error);
    res.status(500).json({ message: "Something went wrong" });
  }
};




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
  const updateBlog = await blogs.findByIdAndUpdate(id,{...req.body},{ new: true })
  if (!updateBlog) {
    res.status(404).json({
        message: "blog not found",
    })
    return
  }
  res.status(200).json({
    message : "update blog Successfully",
    blog: updateBlog, // ✅ Yeh return kar raha hoon

  })
  
} catch (error) {
  res.status(404).json({
    error : error.message
  })
}
  
}

export  {addBlog,allBlogs,deleteBlog,editBlog,singleuserBlogs}