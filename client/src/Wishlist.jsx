import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, useUser } from "./api";
import { StayCard } from "./pages.jsx";

export default function Wishlist() {
  const { user, setUser } = useUser();
  const [items, setItems] = useState(null), [err, setErr] = useState(""), [hover, setHover] = useState(null);
  useEffect(() => { if (user) api("/wishlist").then(setItems).catch((e) => setErr(e.message)); }, [user?._id]);
  // tapping the heart here removes the stay from the list
  const heart = async (e, id) => {
    e.preventDefault();
    const { wishlist } = await api("/wishlist/" + id, { method: "POST" });
    setUser({ ...user, wishlist });
    setItems((list) => list.filter((l) => wishlist.includes(l._id)));
  };
  if (!user) return (<div><h1>Wishlist</h1><p className="muted">Log in to see the stays you saved.</p><Link to="/login" className="pill">Log in</Link></div>);
  return (<div>
    <h1>Wishlist</h1>
    {err && <p className="err">{err}</p>}
    {items && !items.length && <p className="muted">No saved stays yet. Tap the ♡ on any stay to save it here.</p>}
    <div className="grid">{(items || []).map((l) => <StayCard key={l._id} l={l} tax={false} user={user} heart={heart} hover={hover} setHover={setHover} />)}</div>
  </div>);
}