import { upload } from "../middleware/multer.middleware.js";
import express from 'express';
import { blogg } from '../controller/blogs.controller.js';


const router = express.Router()

router.post('/blogs', upload.single('image') ,blogg );

export default router