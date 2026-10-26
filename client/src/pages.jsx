import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, inr, useUser, fixImg } from "./api";
import MapView from "./MapView.jsx";
import Gallery from "./Gallery.jsx";
import Carousel from "./Carousel.jsx";
const CATS = ["All","Beach","Mountain","City","Forest","Snow","Lake","Camping","Historical","Desert","Farm"];
const rate = (l) => (l.reviewCount ? `★ ${l.avgRating} (${l.reviewCount})` : "New");

const fav = (l) => l.reviewCount >= 3 && l.avgRating >= 4.8; // "Guest favourite" rule
const placeOf = (l) => l.place || (l.location || "").split(",")[0].trim();
const TITLES = [(p) => `Popular stays in ${p}`, (p) => `Check out stays in ${p}`, (p) => `Places to stay in ${p}`];

// Group stays into home-page shelves: places with 2+ stays get their own row, the rest share one.
function shelves(items) {
  const by = new Map(), rows = [], rest = [];
  items.forEach((l) => by.set(placeOf(l), [...(by.get(placeOf(l)) || []), l]));
  by.forEach((list, place) => (list.length > 1 ? rows.push({ place, list }) : rest.push(...list)));
  rows.sort((a, b) => b.list.length - a.list.length);
  if (rest.length) rows.push({ place: null, list: rest });
  return rows;
}

export function StayCard({ l, tax, user, heart, hover, setHover }) {
  return (
    <Link to={`/listings/${l._id}`} className={"card" + (hover === l._id ? " hot" : "")} onMouseEnter={() => setHover(l._id)} onMouseLeave={() => setHover(null)}>
      <div className="img"><img src={l.image} alt={l.title} loading="lazy" onError={fixImg} />{fav(l) && <span className="fav">Guest favourite</span>}<button className="heart" aria-label="Save stay" onClick={(e) => heart(e, l._id)}>{user?.wishlist?.includes(l._id) ? "♥" : "♡"}</button></div>
      <div className="row"><b>{l.title}</b><span>{rate(l)}</span></div>
      <div className="muted">{l.propertyType ? `${l.propertyType} in ${(l.location || "").split(",")[0]}` : l.location}</div>
      <div><b>{inr(tax ? l.priceWithTaxes : l.price)}</b> / night{tax && " incl. taxes"}</div>
    </Link>
  );
}

export function Home() {
  const { user, setUser } = useUser();
  const [cat, setCat] = useState("All"), [search, setSearch] = useState(""), [sort, setSort] = useState(""), [tax, setTax] = useState(false);
  const [items, setItems] = useState(null), [err, setErr] = useState(""), [showMap, setShowMap] = useState(false), [hover, setHover] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => api(`/listings?category=${cat}&search=${encodeURIComponent(search)}&sort=${sort}`).then(setItems).catch((e) => setErr(e.message)), 250);
    return () => clearTimeout(t);
  }, [cat, search, sort]);
  const heart = async (e, id) => {
    e.preventDefault(); if (!user) return alert("Log in to save stays");
    setUser({ ...user, wishlist: (await api("/wishlist/" + id, { method: "POST" })).wishlist });
  };
  const cp = { tax, user, heart, hover, setHover };
  const grouped = Boolean(!showMap && cat === "All" && !search && items?.length); // shelves only when browsing, not when filtering
  return (<>
    <input className="search" placeholder="Search by place, stay or country" value={search} onChange={(e) => setSearch(e.target.value)} />
    <div className="cats">{CATS.map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}</div>
    <div className="tools">
      <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Latest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
      <label><input type="checkbox" checked={tax} onChange={(e) => setTax(e.target.checked)} /> Show price with taxes and fees</label>
    </div>
    {err && <p className="err">{err}</p>}
    {items && !items.length && <p className="muted">No stays match. Try another category or search.</p>}
    {grouped ? shelves(items).map((s, i) => (
      <section key={s.place || "more"} className="shelf">
        <h2>{s.place ? <button className="link" onClick={() => setSearch(s.place)}>{TITLES[i % 3](s.place)} ›</button> : "More stays across India"}</h2>
        <div className="shelf-row">{s.list.map((l) => <StayCard key={l._id} l={l} {...cp} />)}</div>
      </section>
    )) : (
      <div className={showMap ? "split" : ""}>
        <div className="grid">{(items || []).map((l) => <StayCard key={l._id} l={l} {...cp} />)}</div>
        {showMap && <div className="mapbox"><MapView listings={items || []} activeId={hover} /></div>}
      </div>
    )}
    <button className="mapbtn" onClick={() => setShowMap(!showMap)}>{showMap ? "Show list" : "Show map"}</button>
  </>);
}

export function Detail() {
  const { id } = useParams(), nav = useNavigate(), { user, setUser } = useUser();
  const [l, setL] = useState(null), [f, setF] = useState({ checkIn: "", checkOut: "", guests: 1 }), [q, setQ] = useState(null);
  const [err, setErr] = useState(""), [rv, setRv] = useState({ rating: 5, comment: "" }), [rerr, setRerr] = useState("");
  const load = () => api("/listings/" + id).then(setL).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  const toggleSave = async () => { if (!user) return nav("/login"); setUser({ ...user, wishlist: (await api("/wishlist/" + id, { method: "POST" })).wishlist }); };
  useEffect(() => {
    setQ(null); setErr("");
    if (f.checkIn && f.checkOut) api("/bookings/quote", { method: "POST", body: { listingId: id, ...f } }).then(setQ).catch((e) => setErr(e.message));
  }, [f, id]);
  const book = async () => {
    if (!user) return nav("/login");
    try { await api("/bookings", { method: "POST", body: { listingId: id, ...f } }); nav("/trips"); } catch (e) { setErr(e.message); }
  };
  const review = async (e) => {
    e.preventDefault(); setRerr("");
    try { await api(`/listings/${id}/reviews`, { method: "POST", body: { ...rv, rating: +rv.rating } }); setRv({ rating: 5, comment: "" }); load(); } catch (x) { setRerr(x.message); }
  };
  if (!l) return <p className="muted">{err || "Loading..."}</p>;
  return (
    <div className="detail">
      <div className="titlebar"><h1>{l.title}</h1><button className="savebtn" onClick={toggleSave}>{user?.wishlist?.includes(l._id) ? "♥ Saved" : "♡ Save"}</button></div><p className="muted">{l.location}, {l.country} · {rate(l)} · Hosted by {l.owner?.name}</p>
      <Gallery images={l.images?.length ? l.images : [l.image]} title={l.title} />
      <div className="cols"><div>
        <p className="spec">{[l.propertyType, l.bedrooms && `${l.bedrooms} bedroom${l.bedrooms > 1 ? "s" : ""}`, l.beds && `${l.beds} bed${l.beds > 1 ? "s" : ""}`, l.baths && `${l.baths} bath${l.baths > 1 ? "s" : ""}`, `Up to ${l.maxGuests} guests`].filter(Boolean).join(" · ")}</p>
        <p>{l.description}</p>
        {l.amenities?.length > 0 && <><h2>What this place offers</h2><ul className="amen">{l.amenities.map((a) => <li key={a}>✓ {a}</li>)}</ul></>}
        {fav(l) && <span className="tag">Guest favourite</span>}{l.safetyTags?.map((t) => <span key={t} className="tag">{t}</span>)}
        {typeof l.lat === "number" && typeof l.lng === "number" && <><h2>Where you'll be</h2><div className="detail-map"><MapView listings={[l]} single /></div><p className="muted">{l.location}, {l.country}</p></>}
        <h2>Reviews from real guests</h2>
        {!l.reviews.length && <p className="muted">No reviews yet. Only guests who booked can review.</p>}
        {l.reviews.map((r) => <div key={r._id} className="rev"><b>{r.author?.name}</b> · ★ {r.rating}<p>{r.comment}</p></div>)}
        {user && <form onSubmit={review} className="form"><h3>Write a review</h3>
          <select value={rv.rating} onChange={(e) => setRv({ ...rv, rating: e.target.value })}>{[5,4,3,2,1].map((n) => <option key={n}>{n}</option>)}</select>
          <textarea required placeholder="How was your stay?" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} />
          {rerr && <p className="err">{rerr}</p>}<button className="btn">Post review</button></form>}
      </div>
      <aside className="book"><b>{inr(l.price)}</b> / night
        <label>Check in<input type="date" value={f.checkIn} onChange={(e) => setF({ ...f, checkIn: e.target.value })} /></label>
        <label>Check out<input type="date" value={f.checkOut} onChange={(e) => setF({ ...f, checkOut: e.target.value })} /></label>
        <label>Guests<input type="number" min="1" max={l.maxGuests} value={f.guests} onChange={(e) => setF({ ...f, guests: +e.target.value })} /></label>
        {q && <div className="break"><div><span>{inr(l.price)} x {q.nights} nights</span><span>{inr(q.cost.base)}</span></div>
          <div><span>Cleaning fee</span><span>{inr(q.cost.cleaning)}</span></div><div><span>Service fee</span><span>{inr(q.cost.service)}</span></div>
          <div><span>GST</span><span>{inr(q.cost.gst)}</span></div><div className="tot"><span>Total</span><span>{inr(q.cost.total)}</span></div></div>}
        {err && <p className="err">{err}</p>}<button className="btn" onClick={book} disabled={!q}>Reserve</button></aside></div>
    </div>);
}

export function Auth({ mode }) {
  const { setUser } = useUser(), nav = useNavigate(), [f, setF] = useState({ name: "", email: "", password: "", role: "guest" }), [err, setErr] = useState("");
  const go = async (e) => { e.preventDefault(); try { setUser(await api("/auth/" + mode, { method: "POST", body: f })); nav("/"); } catch (x) { setErr(x.message); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<form className="form narrow" onSubmit={go}><h1>{mode === "login" ? "Log in" : "Create your account"}</h1>
    {mode === "signup" && <input required placeholder="Full name" value={f.name} onChange={set("name")} />}
    <input required type="email" placeholder="Email" value={f.email} onChange={set("email")} />
    <input required type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set("password")} />
    {mode === "signup" && <select value={f.role} onChange={set("role")}><option value="guest">I want to travel</option><option value="host">I want to host</option></select>}
    {err && <p className="err">{err}</p>}<button className="btn">{mode === "login" ? "Log in" : "Sign up"}</button></form>);
}

export function Copilot() {
  const [prompt, setPrompt] = useState(""), [res, setRes] = useState(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const ex = ["Plan a 3-day Manali trip under ₹12,000 for two people", "Weekend in Manali for 4 friends under ₹20,000, we love adventure"];
  const run = async () => { setBusy(true); setErr(""); setRes(null); try { setRes(await api("/copilot/plan", { method: "POST", body: { prompt } })); } catch (e) { setErr(e.message); } setBusy(false); };
  return (<div className="detail"><h1>AI Travel Copilot</h1><p className="muted">Describe your trip. You get real stays, a day-by-day plan and a cost breakdown.</p>
    <textarea className="big" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={ex[0]} />
    <div className="cats">{ex.map((x) => <button key={x} onClick={() => setPrompt(x)}>{x}</button>)}</div>
    <button className="btn" disabled={busy || prompt.length < 10} onClick={run}>{busy ? "Planning..." : "Plan my trip"}</button>
    {err && <p className="err">{err}</p>}
    {res?.message && <p className="err">{res.message}</p>}
    {res?.stays?.length > 0 && <>
      <h2>Stays that fit your budget</h2>
      <div className="grid">{res.stays.map((s) => <Link key={s.listingId} to={`/listings/${s.listingId}`} className="card"><div className="img"><Carousel images={s.images?.length ? s.images : [s.image]} alt={s.title} /></div>
        <b>{s.title}</b><div>{inr(s.cost.total)} total incl. taxes and fees</div><p className="muted">{s.why}</p></Link>)}</div>
      <h2>Your itinerary</h2>
      {res.itinerary.map((d) => <div key={d.day} className="rev"><b>Day {d.day}: {d.theme}</b>
        <ul>{d.activities.map((a) => <li key={a.id}>{a.name} · {a.costPerPerson ? inr(a.costPerPerson) + " per person" : "Free"}</li>)}</ul>{d.note && <p className="muted">{d.note}</p>}</div>)}
      <h2>Cost estimate</h2><div className="break">{["stay","activities","food","transport"].map((k) => <div key={k}><span>{k[0].toUpperCase() + k.slice(1)}</span><span>{inr(res.estimate[k])}</span></div>)}
        <div className="tot"><span>Total</span><span>{inr(res.estimate.total)}</span></div></div>
      <p>{res.withinBudget ? `Within budget, ${inr(res.remaining)} to spare.` : `Over budget by ${inr(-res.remaining)}.`}</p></>}
  </div>);
}

export function Trips() {
  const [b, setB] = useState(null), [err, setErr] = useState("");
  useEffect(() => { api("/bookings/mine").then(setB).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="err">{err}</p>;
  return (<div><h1>My trips</h1>{b && !b.length && <p className="muted">No trips yet. Find a stay on the home page.</p>}
    {(b || []).map((x) => <Link key={x._id} to={`/listings/${x.listing._id}`} className="rev"><b>{x.listing.title}</b> · {x.listing.location}
      <div className="muted">{new Date(x.checkIn).toLocaleDateString("en-IN")} to {new Date(x.checkOut).toLocaleDateString("en-IN")} · {inr(x.cost.total)}</div></Link>)}</div>);
}
