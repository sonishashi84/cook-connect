//App.jsx
import { useState } from "react";
import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    setUser(data.user);
    setPage("profile");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  if (page === "profile" && user) {
    return (
      <div className="register-container">
        <div className="register-form">
          <h1>Login Successful!</h1>
          <p>Welcome, {user.name}</p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  if (page === "register") {
    return <Register onShowLogin={() => setPage("login")} />;
  }

  return (
    <Login onLogin={handleLogin} onShowRegister={() => setPage("register")} />
  );
}

export default App;
