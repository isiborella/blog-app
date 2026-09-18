import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Blog from "./Blog";
import BlogDetails from "./components/BlogDetails";
import { logout } from "./auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("register");

  // BrowserRouter wraps everything so react-router hooks work at every level
  return (
    <BrowserRouter>
      {!user ? (
        // ── Auth screens ──────────────────────────────────────────────
        <>
          {page === "login" ? (
            <Login
              setUser={setUser}
              goToRegister={() => setPage("register")}
            />
          ) : (
            <Register
              setUser={setUser}
              goToLogin={() => setPage("login")}
            />
          )}
        </>
      ) : (
        // ── Authenticated app ─────────────────────────────────────────
        <div>
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              setUser(null);
            }}
          >
            Logout
          </button>

          <Routes>
            <Route path="/" element={<Blog user={user} />} />
            <Route path="/posts/:id" element={<BlogDetails />} />
            {/* Redirect any unknown path back home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  );
}
