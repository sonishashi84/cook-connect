//PostFeed.jsx
import { useEffect, useState } from "react";
import CreatePost from "./CreatePost";

const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

function PostFeed({ user, token, onLogin, onRegister, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingPostId, setSubmittingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    city: "",
    area: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams();

        if (activeFilters.city) {
          queryParams.set("city", activeFilters.city);
        }

        if (activeFilters.area) {
          queryParams.set("area", activeFilters.area);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `${API_URL}?${queryString}` : API_URL;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch posts");
        }

        setCommentsByPost({});
        setPosts(data.posts);
      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Unable to connect to the server. Please try again."
            : err.message,
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilters, refreshKey]);

  useEffect(() => {
    if (posts.length === 0) return;

    const fetchComments = async () => {
      const results = await Promise.all(
        posts.map(async (post) => {
          try {
            const response = await fetch(`${API_URL}/${post._id}/comments`);
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Failed to fetch comments");
            }

            return [post._id, data.comments];
          } catch {
            return [post._id, null];
          }
        }),
      );

      setCommentsByPost((previous) => {
        const updated = { ...previous };

        results.forEach(([postId, comments]) => {
          if (comments !== null) {
            updated[postId] = comments;
          }
        });

        return updated;
      });
    };

    fetchComments();
  }, [posts]);

  const handleCommentChange = (postId, value) => {
    setCommentInputs((previous) => ({
      ...previous,
      [postId]: value,
    }));

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: "",
    }));
  };

  const handleAddComment = async (event, postId) => {
    event.preventDefault();

    const text = commentInputs[postId]?.trim();

    if (!text) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: "Please enter a comment.",
      }));
      return;
    }

    if (text.length > 1000) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: "Comment cannot exceed 1000 characters.",
      }));
      return;
    }

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: "",
    }));
    setSubmittingPostId(postId);

    try {
      const response = await fetch(`${API_URL}/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: [...(previous[postId] || []), data.comment],
      }));

      setCommentInputs((previous) => ({
        ...previous,
        [postId]: "",
      }));
    } catch (err) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]:
          err.message === "Failed to fetch"
            ? "Unable to connect to the server. Please try again."
            : err.message,
      }));
    } finally {
      setSubmittingPostId(null);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? Its comments will also be deleted.",
    );

    if (!confirmed) return;

    setDeletingPostId(postId);
    setDeleteError("");

    try {
      const response = await fetch(`${API_URL}/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      setPosts((previous) => previous.filter((post) => post._id !== postId));

      setCommentsByPost((previous) => {
        const updated = { ...previous };
        delete updated[postId];
        return updated;
      });

      setCommentInputs((previous) => {
        const updated = { ...previous };
        delete updated[postId];
        return updated;
      });

      setCommentErrors((previous) => {
        const updated = { ...previous };
        delete updated[postId];
        return updated;
      });
    } catch (err) {
      setDeleteError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : err.message,
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();

    setActiveFilters({
      city: cityInput.trim(),
      area: areaInput.trim(),
    });
  };

  const handleClearFilters = () => {
    setCityInput("");
    setAreaInput("");
    setActiveFilters({ city: "", area: "" });
  };

  return (
    <div className="home-page">
      <header className="home-navbar">
        <div className="home-navbar-inner">
          <button
            type="button"
            className="brand-button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            CookSetu
          </button>

          <nav className="navbar-actions" aria-label="Main navigation">
            {user && token ? (
              <>
                <span className="navbar-user">Hi, {user.name}</span>
                <button type="button" className="nav-button" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className="nav-button" onClick={onLogin}>
                  Login
                </button>
                <button
                  type="button"
                  className="nav-button nav-button-primary"
                  onClick={onRegister}
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="home-content">
        <CreatePost
          user={user}
          token={token}
          onLogin={onLogin}
          onPostCreated={() => setRefreshKey((previous) => previous + 1)}
        />

        <section className="filter-section">
          <form onSubmit={handleApplyFilters} className="location-filter-form">
            <div className="filter-fields">
              <div className="filter-field">
                <label htmlFor="filter-city">City</label>
                <input
                  id="filter-city"
                  type="text"
                  value={cityInput}
                  onChange={(event) => setCityInput(event.target.value)}
                  placeholder="e.g. Bengaluru"
                />
              </div>

              <div className="filter-field">
                <label htmlFor="filter-area">Area / Locality</label>
                <input
                  id="filter-area"
                  type="text"
                  value={areaInput}
                  onChange={(event) => setAreaInput(event.target.value)}
                  placeholder="e.g. Marathahalli"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button type="submit" disabled={loading}>
                Apply Filters
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleClearFilters}
                disabled={
                  loading ||
                  (!cityInput &&
                    !areaInput &&
                    !activeFilters.city &&
                    !activeFilters.area)
                }
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="posts-section">
          {loading && <p>Loading posts...</p>}
          {error && <p className="error-message">{error}</p>}
          {deleteError && <p className="error-message">{deleteError}</p>}

          {!loading && !error && posts.length === 0 && (
            <p className="empty-posts">
              No posts yet. Be the first to create one!
            </p>
          )}

          {!loading &&
            !error &&
            posts.map((post) => {
              const comments = commentsByPost[post._id];
              const isSubmitting = submittingPostId === post._id;

              return (
                <article className="post-card" key={post._id}>
                  <div className="post-header">
                    <div className="post-author-avatar" aria-hidden="true">
                      {(post.createdBy?.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="post-author-details">
                      <strong className="post-author-name">
                        {post.createdBy?.name || "Community member"}
                      </strong>
                      <span className="post-meta">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                      <span className="post-meta">
                        {post.area}, {post.city}
                      </span>
                    </div>

                    {user &&
                      token &&
                      (post.createdBy?._id || post.createdBy) === user.id && (
                        <button
                          type="button"
                          className="delete-post-button"
                          onClick={() => handleDeletePost(post._id)}
                          disabled={deletingPostId === post._id}
                        >
                          {deletingPostId === post._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                  </div>

                  <p className="post-description">{post.description}</p>

                  <div className="comments-section">
                    <h4>Comments ({comments?.length ?? "..."})</h4>

                    {comments === undefined && <p>Loading comments...</p>}

                    {comments === null && (
                      <p className="error-message">
                        Unable to load comments. Please refresh the page.
                      </p>
                    )}

                    {comments?.length === 0 && (
                      <p className="no-comments">No comments yet.</p>
                    )}

                    {comments?.map((comment) => (
                      <div className="comment-card" key={comment._id}>
                        <p className="comment-author">
                          <strong>{comment.createdBy?.name || "User"}</strong>
                          {comment.createdBy?.role && (
                            <> · {comment.createdBy.role}</>
                          )}
                        </p>

                        <p className="comment-text">{comment.text}</p>

                        <p className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}

                    {user && token ? (
                      <form
                        className="add-comment-form"
                        onSubmit={(event) => handleAddComment(event, post._id)}
                      >
                        <label htmlFor={`comment-${post._id}`}>
                          Add a comment
                        </label>

                        <textarea
                          id={`comment-${post._id}`}
                          value={commentInputs[post._id] || ""}
                          onChange={(event) =>
                            handleCommentChange(post._id, event.target.value)
                          }
                          placeholder="Write your comment..."
                          rows={2}
                          maxLength={1000}
                          required
                          disabled={isSubmitting}
                        />

                        {commentErrors[post._id] && (
                          <p className="error-message">
                            {commentErrors[post._id]}
                          </p>
                        )}

                        <button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Adding..." : "Add Comment"}
                        </button>
                      </form>
                    ) : (
                      <p className="login-to-comment">
                        <button
                          type="button"
                          className="text-button"
                          onClick={onLogin}
                        >
                          Login
                        </button>{" "}
                        to add a comment.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
        </section>
      </main>
    </div>
  );
}

export default PostFeed;
