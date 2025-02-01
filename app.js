import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express(); // `app` ko pehle initialize karo

const corsOptions = {
  origin: 'http://localhost:5173', // Frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
};

// Use CORS middleware globally
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Export the Express app for Vercel
export default app;