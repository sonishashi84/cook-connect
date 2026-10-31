import { useState,useEffect } from "react";
import { BANGALORE_AREAS } from "../../constants/locations";

const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

function CreatePost({ user, token, onLogin, onPostCreated }) {
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedDescription = description.trim();
    const trimmedArea = area.trim();

    if (!trimmedDescription) {
      setError("Please enter your message.");
      return;
    }

    if (!BANGALORE_AREAS.includes(trimmedArea)) {
      setError("Please select your area.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: trimmedDescription,
          city: "Bangalore",
          area: trimmedArea,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setDescription("");
      setArea("");
      setSuccess("Your post has been published!");

      onPostCreated();
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

  useEffect(() => {
  if (!success) return;

  const timer = setTimeout(() => {
    setSuccess("");
  }, 3500);

  return () => clearTimeout(timer);
}, [success]);

  return (
    <section className="create-post-section">
      <form
        onSubmit={
          user && token
            ? handleSubmit
            : (event) => {
                event.preventDefault();
                onLogin();
              }
        }
      >
        <textarea
          className="create-post-message"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Write here if looking for cook or cooking services job..."
          rows={3}
          maxLength={2000}
          required
          disabled={!user || !token || loading}
        />

        <div className="create-post-location-row">
          <input
            type="text"
            value="Bangalore"
            disabled
            aria-label="City"
            className="create-post-city"
          />
          <div className="create-post-area-wrapper">
            <input
              type="text"
              value={area}
              onChange={(event) => {
                setArea(event.target.value);
                setIsAreaOpen(true);
              }}
              onFocus={() => setIsAreaOpen(true)}
              onBlur={() => {
                setTimeout(() => setIsAreaOpen(false), 150);
              }}
              placeholder="Select your area..."
              aria-label="Area"
              aria-expanded={isAreaOpen}
              disabled={!user || !token || loading}
              className="create-post-area"
            />

            {isAreaOpen && (
              <div className="create-post-area-options">
                {BANGALORE_AREAS.filter((locality) =>
                  locality.toLowerCase().includes(area.toLowerCase()),
                ).map((locality) => (
                  <button
                    type="button"
                    key={locality}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setArea(locality);
                      setIsAreaOpen(false);
                    }}
                  >
                    {locality}
                  </button>
                ))}

                {BANGALORE_AREAS.filter((locality) =>
                  locality.toLowerCase().includes(area.toLowerCase()),
                ).length === 0 && (
                  <p className="no-area-options">No matching area found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="create-post-actions">
          {user && token ? (
            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          ) : (
            <button type="button" onClick={onLogin}>
              Login to post
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default CreatePost;
