//routes/postRoutes.js

const express = require("express");
const mongoose = require("mongoose");

const Post = require("../models/Post");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/posts
// Public: fetch posts based on city and area

router.get("/", async (req, res) => {
  try {
    const { city, area } = req.query;

    const filter = {};

    if (city && city.trim()) {
      filter.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (area && area.trim()) {
      filter.area = new RegExp(`^${area.trim()}$`, "i");
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching posts",
    });
  }
});


// POST /api/posts
// Protected: create a post
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

// GET /api/posts/:postId/comments
// Public: fetch comments for one post
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("createdBy", "name role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
});

// POST /api/posts/:postId/comments
// Protected: add a comment
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters",
      });
    }

    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user",
      });
    }

    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: postId,
      createdBy: req.user.id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("createdBy", "name role");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});

module.exports = router;