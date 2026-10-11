Step 2: Set up the backend

Open the VS Code terminal (`Ctrl + ``) and run below commands:
----------
cd backend
npm init -y 
npm install express mongoose dotenv cors
npm install --save-dev nodemon
-----------
Create this file structure:

backend/
├── server.js
├── .env
├── .gitignore
└── package.json
-------------
Add the following to backend/.gitignore:

node_modules/
.env
------------
In backend/.env, add:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cook_connect

The backend also accepts `MONGO_URI` for existing environment files.
-----------
Step 3: Create a basic Express server
Create backend/server.js:

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cook Connect backend is running",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
------------
Step 2: Set up the React frontend

Open a second terminal in VS Code. Keep your backend terminal running.

First, make sure you're in the cook-connect root folder, then run:

cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
---------------------------
Step 1 — Connect Express to MongoDB

Since you've already installed MongoDB and used MongoDB Compass, we'll use your local MongoDB instance first.
2. Update backend/server.js

const dns = require("dns");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
----------Till here backend and front end foundation is done------------
Now we need to test the same in frontend, we will call that local api and test if getting connected response from api or not and will display in UI
Add this code in frontend app.js

import { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [message, setMessage] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError("Unable to connect to the backend.");
        console.error(err);
      }
    };

    checkBackend();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Cook Connect</h1>
      <h2>Frontend to Backend Test</h2>

      <p>Backend status: {error ? error : message}</p>
    </div>
  );
}
export default App;
---------------------------------------
Step 1 — Prepare the backend for registration

First, we'll create the database model and API endpoint. We won't change the React UI yet.

1. Install the password-hashing package

Open a terminal in your backend folder and run:

npm install bcryptjs
------------------
2. Create the User model

Create a new file: backend/models/User.js

If the models folder doesn't exist, create it.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "COOK"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
--------------------------
Create the registration controller

Create backend/controllers/authController.js. Create the controllers folder if needed.
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
-------------------
4. Create the auth route

Create backend/routes/authRoutes.js:

const express = require("express");
const { register } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

module.exports = router;

---------------
5. Connect the route to your Express server

Open backend/server.js.

Add this import near the top:
const authRoutes = require("./routes/authRoutes");
--after----
Then, after your existing middleware:

app.use(cors());
app.use(express.json());
--keep this code---
Add:

app.use("/api/auth", authRoutes);
------------
backend structure
backend/
├── controllers/
│   └── authController.js
├── models/
│   └── User.js
├── routes/
│   └── authRoutes.js
├── server.js
├── .env
├── .gitignore
└── package.json
----------
test
http://localhost:5000/api/auth/register

{
  "name": "Test Customer",
  "email": "customer@example.com",
  "phone": "9876543210",
  "password": "TestPass123",
  "role": "CUSTOMER"
}
--------------------
Step 2 — Build the registration UI
1. Create a simple frontend structure
frontend/
└── src/
    ├── features/
    │   └── auth/
    │       └── Register.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css
-------------
2. Create Register.jsx

import { useState } from "react";

const API_URL = "http://localhost:5000/api/auth/register";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "CUSTOMER",
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {" "}
      <form className="register-form" onSubmit={handleSubmit}>
        {" "}
        <h1>Cook Connect</h1> <p>Create your account</p>
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <label htmlFor="role">Register as</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="CUSTOMER">Customer — looking for a cook</option>
          <option value="COOK">Cook — offering cooking services</option>
        </select>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
--------------
3. Update App.jsx

Replace the default Vite content with:

import Register from "./features/auth/Register";

function App() {
  return <Register />;
}

export default App;
-------------
add index.css
* {
  box-sizing: border-box;
  }

body {
margin: 0;
font-family: Arial, sans-serif;
background: #f4f6f8;
color: #222;
}

.register-container {
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
padding: 24px;
}

.register-form {
width: 100%;
max-width: 440px;
padding: 32px;
background: white;
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.register-form h1 {
margin: 0 0 8px;
text-align: center;
}

.register-form > p:first-of-type {
text-align: center;
color: #666;
margin-bottom: 24px;
}

.register-form label {
display: block;
margin: 16px 0 6px;
font-weight: 600;
}

.register-form input,
.register-form select {
width: 100%;
padding: 11px;
border: 1px solid #ccc;
border-radius: 6px;
font-size: 15px;
}

.register-form button {
width: 100%;
margin-top: 24px;
padding: 12px;
border: none;
border-radius: 6px;
background: #216e50;
color: white;
font-size: 16px;
cursor: pointer;
}

.register-form button:disabled {
opacity: 0.65;
cursor: not-allowed;
}

.error-message {
color: #b42318;
}

.success-message {
color: #167344;
}

@media (max-width: 480px) {
.register-form {
padding: 24px;
}
}
