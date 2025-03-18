const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth");
const facultyRouter = require("./routes/faculty");
const clubRouter = require("./routes/club");
const eventRouter = require("./routes/event");

const app = express();

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use('/faculty', facultyRouter);
app.use('/club', clubRouter);
app.use('/event', eventRouter);


// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

