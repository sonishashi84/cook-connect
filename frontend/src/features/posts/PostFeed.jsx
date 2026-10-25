
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

function PostFeed({ user, token, onCreatePost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingPostId, setSubmittingPostId] = useState(null);

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
            : err.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;

    const fetchComments = async () => {
      const results = await Promise.all(
        posts.map(async (post) => {
          try {
            const response = await fetch(
              `${API_URL}/${post._id}/comments`,
            );
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Failed to fetch comments");
            }

            return [post._id, data.comments];
          } catch (err) {
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
      const response = await fetch(
        `${API_URL}/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        },
      );

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

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Cook Connect</h1>
        <p>Find a cook or discover cook opportunities near you.</p>

        <div className="feed-actions">
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
          posts.map((post) => {
            const comments = commentsByPost[post._id];
            const isSubmitting = submittingPostId === post._id;

            return (
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

                <hr />

                <h4>Comments ({comments?.length ?? "..."})</h4>

                {comments === undefined && <p>Loading comments...</p>}

                {comments === null && (
                  <p className="error-message">
                    Unable to load comments. Please refresh the page.
                  </p>
                )}

                {comments?.length === 0 && (
                  <p>No comments yet.</p>
                )}

                {comments?.map((comment) => (
                  <div className="comment-card" key={comment._id}>
                    <p>
                      <strong>
                        {comment.createdBy?.name || "User"}
                      </strong>
                      {comment.createdBy?.role && (
                        <> · {comment.createdBy.role}</>
                      )}
                    </p>

                    <p>{comment.text}</p>

                    <p className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {user && token ? (
                  <form
                    onSubmit={(event) =>
                      handleAddComment(event, post._id)
                    }
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
                      rows={3}
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
                  <p>Login to add a comment.</p>
                )}
              </article>
            );
          })}
      </div>
    </div>
  );
}

export default PostFeed;
