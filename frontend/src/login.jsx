import { useState } from "react";
import axios from "axios";
import { setToken } from "./auth";
import "./Auth.css";

export default function Login({ setUser, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:1337/api/auth/local",
        {
          identifier: email,
          password,
        }
      );

      setToken(res.data.jwt);
      setUser(res.data.user);
    } catch (err) {
      alert("Invalid login details");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p className="switch-text">
          Don’t have an account?{" "}
          <span onClick={goToRegister}>Sign up</span>
        </p>
      </div>
    </div>
  );
}