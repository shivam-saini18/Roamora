import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, UserCtx } from "./api";
import { Home, Detail, Auth, Copilot, Trips } from "./pages.jsx";
import Wishlist from "./Wishlist.jsx";
export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { api("/auth/me").then(setUser).catch(() => {}); }, []);
  const logout = async () => { await api("/auth/logout", { method: "POST" }); setUser(null); };
  return (
    <UserCtx.Provider value={{ user, setUser }}><BrowserRouter>
      <header className="nav"><Link to="/" className="logo">Roamora</Link>
        <nav><Link to="/copilot">AI Copilot</Link><Link to="/wishlist">Wishlist{user?.wishlist?.length > 0 && ` (${user.wishlist.length})`}</Link>
          {user ? <><Link to="/trips">My trips</Link><button className="link" onClick={logout}>Log out ({user.name})</button></>
                : <><Link to="/login">Log in</Link><Link to="/signup" className="pill">Sign up</Link></>}</nav></header>
      <main><Routes>
        <Route path="/" element={<Home />} /><Route path="/listings/:id" element={<Detail />} />
        <Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/copilot" element={<Copilot />} /><Route path="/wishlist" element={<Wishlist />} /><Route path="/trips" element={<Trips />} />
      </Routes></main>
    </BrowserRouter></UserCtx.Provider>
  );
}
