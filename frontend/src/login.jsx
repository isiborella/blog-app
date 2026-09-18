import { useState } from "react";
import axios from "axios";
import { setToken } from "./auth";
import { API_URL } from "./config";
import "./Auth.css";

export default function Login({ setUser, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: email,
        password,
      });

      setToken(res.data.jwt);
      setUser(res.data.user);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          disabled={loading}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className="switch-text">
          Don't have an account?{" "}
          <span onClick={goToRegister}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
