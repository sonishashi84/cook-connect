const dns = require("dns");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cook Connect backend is running",
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();

