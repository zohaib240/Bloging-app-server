import express from 'express';
import { registerUser, loginUser, logoutUser, refreshToken, singleUser} from '../controller/users.controller.js';
import {upload} from "../middleware/multer.middleware.js"
import authenticateUser from "../middleware/auth.middleware.js"; // Token verification middleware

const router = express.Router();

// Public routes
router.post('/auth/login', loginUser); 
router.get('/auth/single-user', authenticateUser, singleUser);
router.post('/auth/logout', authenticateUser, logoutUser); 
router.get('/refreshToken', refreshToken); 
// Register route with image upload
router.post('/auth/register', upload.single('profileImage'), registerUser);

export default router;






