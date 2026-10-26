import { useEffect, useState } from "react";
import { fixImg } from "./api";

// Airbnb-style photo grid: 1 big photo + up to 4 small ones, "Show all photos" opens every photo.
export default function Gallery({ images = [], title }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  const pics = images.filter(Boolean);
  if (!pics.length) return null;
  const shown = pics.slice(0, 5);
  return (<>
    <div className={"gal n" + shown.length}>
      {shown.map((src, i) => <img key={i} src={src} alt={`${title} photo ${i + 1}`} onClick={() => setOpen(true)} onError={fixImg} />)}
      {pics.length > 1 && <button className="allbtn" onClick={() => setOpen(true)}>Show all {pics.length} photos</button>}
    </div>
    {open && <div className="lightbox" onClick={() => setOpen(false)}>
      <button className="close" aria-label="Close photos" onClick={() => setOpen(false)}>✕</button>
      <div className="lb-list" onClick={(e) => e.stopPropagation()}>
        {pics.map((src, i) => <img key={i} src={src} alt={`${title} photo ${i + 1}`} onError={fixImg} />)}
      </div>
    </div>}
  </>);
}