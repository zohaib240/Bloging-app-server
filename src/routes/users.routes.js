import express from 'express';
import { registerUser, loginUser, logoutUser, refreshToken} from '../controller/users.controller.js';
import {upload} from "../middleware/multer.middleware.js"
import authenticateUser from "../middleware/auth.middleware.js"; // Token verification middleware

const router = express.Router();

// Public routes
router.post('/auth/login', loginUser); 
router.post('/auth/logout', authenticateUser, logoutUser); 
router.post('/refreshToken', refreshToken); 
// Register route with image upload
router.post('/auth/register', upload.single('profileImage'), registerUser);

export default router;






