import { useState } from "react";
import axios from "axios";
import { API_URL } from "./App";

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    const payload = isRegistering
      ? { username, password, full_name: fullName }
      : { username, password };

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isRegistering) {
        alert("Registration successful! Please login.");
        setIsRegistering(false);
      } else {
        // Login successful, pass token up
        onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="auth-card">
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? "Sign Up" : "Sign In"}</button>
      </form>

      <p
        className="toggle-text"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </p>
    </div>
  );
}

export default Login;
