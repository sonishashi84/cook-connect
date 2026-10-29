//App.jsx
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
    setPage("feed");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setPage("feed");
  };

if (page === "register") {
  return (
    <Register
      onShowLogin={() => setPage("login")}
      onShowFeed={() => setPage("feed")}
    />
  );
}

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setPage("register")}
        onShowFeed={() => setPage("feed")}
      />
    );
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
    <PostFeed
      user={user}
      token={token}
      onLogin={() => setPage("login")}
      onRegister={() => setPage("register")}
      onLogout={handleLogout}
      onCreatePost={() =>
        setPage(user && token ? "createPost" : "login")
      }
    />
  );
}

export default App;
