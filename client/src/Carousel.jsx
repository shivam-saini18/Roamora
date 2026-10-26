import { useState } from "react";
import { fixImg } from "./api";

// Photo slider for cards: left/right arrows and dots. The arrows don't open the link the card sits in.
export default function Carousel({ images = [], alt = "" }) {
  const pics = images.filter(Boolean), [i, setI] = useState(0);
  if (!pics.length) return null;
  const go = (e, d) => { e.preventDefault(); e.stopPropagation(); setI((i + d + pics.length) % pics.length); };
  return (
    <div className="car">
      <img key={i} src={pics[i]} alt={`${alt} photo ${i + 1}`} loading="lazy" onError={fixImg} />
      {pics.length > 1 && <>
        <button className="car-btn prev" aria-label="Previous photo" onClick={(e) => go(e, -1)}>&lsaquo;</button>
        <button className="car-btn next" aria-label="Next photo" onClick={(e) => go(e, 1)}>&rsaquo;</button>
        <div className="car-dots">{pics.map((_, n) => <span key={n} className={n === i ? "on" : ""} />)}</div>
      </>}
    </div>
  );
}