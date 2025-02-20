import { upload } from "../middleware/multer.middleware.js";
import express from 'express';
import { allBlogs, addBlog,deleteBlog, editBlog, singleuserBlogs } from '../controller/blogs.controller.js';
import authenticateUser from "../middleware/auth.middleware.js";


const blogrouter = express.Router()

blogrouter.post('/addBlog',authenticateUser,upload.single('image'),addBlog);
blogrouter.get('/allBlogs',allBlogs);
blogrouter.get('/singleuserBlogs/:id',singleuserBlogs);
blogrouter.delete('/deleteBlog/:id',authenticateUser,deleteBlog);
blogrouter.put('/editBlog/:id',authenticateUser,editBlog);

export default blogrouter