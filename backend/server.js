//server.js

require("dotenv").config();

const dns = require("dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const postRoutes = require("./routes/postRoutes");

// Keep this DNS workaround for now; we'll verify whether it's needed
// when we deploy the application.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cook Connect backend is running",
  });
});

// Temporary endpoint to test authentication
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    userId: req.user.id,
  });
});


const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();
