import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/db/index.js";
import router from './src/routes/users.routes.js'; // Correct import path
import blogrouter from "./src/routes/blogs.routes.js";
import {app} from "./app.js"


// Routes
app.use("/api/v1", router);
app.use("/api/v1", blogrouter);



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
