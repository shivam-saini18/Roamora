import { createContext, useContext } from "react";
export const UserCtx = createContext(); export const useUser = () => useContext(UserCtx);
export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export async function api(path, opts = {}) {
  const r = await fetch("/api" + path, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts, body: opts.body && JSON.stringify(opts.body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong. Try again.");
  return d;
}

export const fixImg = (e) => {
  const i = e.currentTarget, step = +(i.dataset.fb || 0);
  if (step > 1) return;
  i.dataset.fb = String(step + 1);
  if (step === 0) i.src = "https://picsum.photos/seed/" + encodeURIComponent(i.alt) + "/1200/800"; // 1st backup: another photo
  else i.src = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a8a"/><stop offset="1" stop-color="#7a5cff"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="420" font-family="sans-serif" font-size="56" fill="#fff" text-anchor="middle">${i.alt.replace(/[<&>]/g, "")}</text></svg>`); // 2nd backup: a drawn picture, works offline
};