import { useState } from "react";
import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import CreatePost from "./features/posts/CreatePost";
import PostFeed from "./features/posts/PostFeed";
import "./App.css";

function App() {
  const [page, setPage] = useState("feed");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
    setPage("createPost");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setPage("feed");
  };

  if (page === "feed") {
    return (
      <PostFeed
        onCreatePost={() => setPage(user && token ? "createPost" : "login")}
      />
    );
  }
  if (page === "register") {
    return <Register onShowLogin={() => setPage("login")} />;
  }

  if (page === "createPost" && user && token) {
    return (
      <CreatePost
        user={user}
        token={token}
        onLogout={handleLogout}
        onViewPosts={() => setPage("feed")}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onShowRegister={() => setPage("register")}
      onShowFeed={() => setPage("feed")}
    />
  );
}

export default App;
