
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

function PostFeed({ onShowLogin, onShowRegister, onCreatePost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch posts");
        }

        setPosts(data.posts);
      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Unable to connect to the server. Please try again."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Cook Connect</h1>
        <p>Find a cook or discover cook opportunities near you.</p>

        <div className="feed-actions">
          <button type="button" onClick={onShowLogin}>
            Login
          </button>

          <button type="button" onClick={onShowRegister}>
            Register
          </button>

          <button type="button" onClick={onCreatePost}>
            Create a Post
          </button>
        </div>

        <hr />

        <h2>Latest Posts</h2>

        {loading && <p>Loading posts...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p>No posts yet. Be the first to create one!</p>
        )}

        {!loading &&
          !error &&
          posts.map((post) => (
            <article className="post-card" key={post._id}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>

              <p>
                <strong>Location:</strong> {post.area}, {post.city}
              </p>

              <p>
                <strong>Posted:</strong>{" "}
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
      </div>
    </div>
  );
}

export default PostFeed;
