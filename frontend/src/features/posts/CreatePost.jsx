import { useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

function CreatePost({ user, token, onLogout, onViewPosts }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    area: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setSuccess("Post created successfully!");

      setFormData({
        title: "",
        description: "",
        city: "",
        area: "",
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
      <div className="register-form">
        <h1>Cook Connect</h1>

        <p>Welcome, {user.name}</p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <button type="button" onClick={onLogout}>
          Logout
        </button>

        <button type="button" onClick={onViewPosts}>
          View Posts
        </button>

        <hr />

        <h2>Create a Post</h2>
        <p>Share a cook requirement or your availability.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="post-title">Post title</label>
          <input
            id="post-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Looking for a cook"
            required
          />

          <label htmlFor="post-description">Description</label>
          <textarea
            id="post-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the requirement or availability"
            required
            rows={4}
          />

          <label htmlFor="post-city">City</label>
          <input
            id="post-city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="Bengaluru"
            required
          />

          <label htmlFor="post-area">Area / locality</label>
          <input
            id="post-area"
            name="area"
            type="text"
            value={formData.area}
            onChange={handleChange}
            placeholder="Marathahalli"
            required
          />

          {error && <p className="error-message">{error}</p>}

          {success && <p>{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
