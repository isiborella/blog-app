import { useState } from "react";
import axios from "axios";
import { setToken } from "./auth";
import "./Auth.css";

export default function Register({ setUser, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:1337/api/auth/local/register",
        {
          username,
          email,
          password,
        }
      );

      setToken(res.data.jwt);
      setUser(res.data.user);
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Sign Up</button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={goToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}