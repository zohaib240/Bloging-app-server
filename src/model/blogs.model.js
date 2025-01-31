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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "postedBy is required"],
    },
  },
{
    timestamps : true
});


export default mongoose.model("blogs", blogsSchema);








