import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Blog from "./Blog";
import { logout } from "./auth";

export default function App() {
  const [user, setUser] = useState(null);

  // SIGNUP IS FIRST SCREEN
  const [page, setPage] = useState("register");

  if (!user) {
    return (
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
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          logout();
          setUser(null);
        }}
      >
        Logout
      </button>

      <Blog user={user} />
    </div>
  );
}