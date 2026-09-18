import { useState } from "react";
import axios from "axios";
import { setToken } from "./auth";
import { API_URL } from "./config";
import "./Auth.css";

export default function Register({ setUser, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/local/register`, {
        username,
        email,
        password,
      });

      setToken(res.data.jwt);
      setUser(res.data.user);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        "Sign up failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          disabled={loading}
        />

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={goToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}
