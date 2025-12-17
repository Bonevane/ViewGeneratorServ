import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

// URL of your Python Controller Service
export const API_URL = "http://35.222.45.221:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // If token exists in localStorage, sync it to state
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NUST Video Streamer</h1>
        {token && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>
      <main>
        {token ? <Dashboard token={token} /> : <Login onLogin={handleLogin} />}
      </main>
    </div>
  );
}

export default App;
