
import { useState } from "react";
import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import CreatePost from "./features/posts/CreatePost";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
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
    setPage("login");
  };

  if (page === "createPost" && user && token) {
    return (
      <CreatePost
        user={user}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "register") {
    return <Register onShowLogin={() => setPage("login")} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onShowRegister={() => setPage("register")}
    />
  );
}

export default App;
