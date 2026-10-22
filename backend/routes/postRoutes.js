
const express = require("express");
const mongoose = require("mongoose");

const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, city, area } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !city?.trim() ||
      !area?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, city, and area are required",
      });
    }

    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user",
      });
    }

    const post = await Post.create({
      title,
      description,
      city,
      area,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
});

module.exports = router;
