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

  if (!user) {
    return (
      <>
        {page === "login" ? (
          <Login setUser={setUser} goToRegister={() => setPage("register")} />
        ) : (
          <Register setUser={setUser} goToLogin={() => setPage("login")} />
        )}
      </>
    );
  }

  return (
    <BrowserRouter>
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
          {/* Main blog list */}
          <Route path="/" element={<Blog user={user} />} />

          {/* Single post details page (Task 5) */}
          <Route path="/posts/:id" element={<BlogDetails />} />

          {/* Catch-all — redirect unknown paths back home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
