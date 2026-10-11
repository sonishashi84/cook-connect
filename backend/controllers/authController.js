const bcrypt = require("bcryptjs");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Validate role
    if (!["CUSTOMER", "COOK"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be CUSTOMER or COOK",
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role,
    });

    // Never return the password or password hash
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle duplicate email index errors, including concurrent requests
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

module.exports = { register };