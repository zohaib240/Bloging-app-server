import mongoose from "mongoose";


const blogsSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    blogImage: {
        type: String,
        required: [true, "blogimage is required"],
      },
     postedBy: {
        type: String,
        required: [true, "post is required"],
      },
  },
{
    timestamps : true
});


export default mongoose.model("blogs", blogsSchema);








