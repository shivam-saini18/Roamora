import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { inr, fixImg } from "./api";

// Airbnb-style price pin. Using a divIcon avoids Leaflet's broken default marker images under Vite.
const pin = (price, active) =>
  L.divIcon({ className: "pin-wrap", iconSize: [0, 0], html: `<div class="pin${active ? " on" : ""}">${inr(price)}</div>` });

// Zoom the map so every listing is visible (or centre on a single one).
function Fit({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
  }, [map, key]);
  return null;
}

// listings: [{ _id, title, image, price, location, lat, lng }]
// activeId: pin to highlight (set when hovering a card), single: detail page (no popup)
export default function MapView({ listings = [], activeId = null, single = false }) {
  const shown = listings.filter((l) => typeof l.lat === "number" && typeof l.lng === "number");
  const points = shown.map((l) => [l.lat, l.lng]);
  return (
    <MapContainer center={points[0] || [22.5, 79]} zoom={5} scrollWheelZoom={!single} className="map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Fit points={points} />
      {shown.map((l) => (
        <Marker key={l._id} position={[l.lat, l.lng]} icon={pin(l.price, l._id === activeId)} zIndexOffset={l._id === activeId ? 1000 : 0} >
          {!single && (
            <Popup>
              <Link to={`/listings/${l._id}`} className="pop">
                <img src={l.image} alt={l.title} onError={fixImg} />
                <b>{l.title}</b>
                <span>{l.location}</span>
                <span>{inr(l.price)} / night</span>
              </Link>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
