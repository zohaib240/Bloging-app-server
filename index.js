import express from "express";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";
import router from './src/routes/users.routes.js'; // Correct import path
import blogrouter from "./src/routes/blogs.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"
dotenv.config();

// new methode 

const app = express(); // `app` ko pehle initialize karo

const corsOptions = {
  origin: ['https://bloging-app-client.vercel.app','http://localhost:5173'], // Frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
};

// Use CORS middleware globally
app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(req.headers);  // Log headers to see what's coming
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", router);
app.use("/api/v1", blogrouter);


app.get("/getcookie",(req,res)=>{
  res.json({
    cookie : req.cookies
  })
})


// Database connection and server start
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });

console.log("Server started...");
