import blogs from "../model/blogs.model.js";




const blogg = async(req,res) =>{

const {title,description,postedBy} = req.body

if (!title || !description || !postedBy) {
    return res.status(400).json({ error: "Email or password missing" });
  }

  try {

    // Check if image is uploaded
    if (!req.file) {
        return res.status(400).json({ error: "Profile image is required" });
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
      message: "User registered successfully",
      data: createBlogs,
    });
    
  } catch (error) {
    res.status(500).json({ error: err.message });

  }
}

export  {blogg}