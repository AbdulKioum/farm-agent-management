import {
  LayersControl,
  TileLayer,
} from "react-leaflet";

export default function MapLayers() {
  const mapKey =
    import.meta.env
      .VITE_MAPTILER_KEY;

  return (
    <LayersControl position="topright">

      {/* Normal */}

      <LayersControl.BaseLayer
        checked
        name="🗺 Normal"
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      {/* Satellite */}

      <LayersControl.BaseLayer
        name="🛰 Satellite"
      >
        <TileLayer
          attribution="© MapTiler"
          url={`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${mapKey}`}
        />
      </LayersControl.BaseLayer>

      {/* Hybrid */}

      <LayersControl.BaseLayer
        name="🌍 Hybrid"
      >
        <TileLayer
          attribution="© MapTiler"
          url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${mapKey}`}
        />
      </LayersControl.BaseLayer>

    </LayersControl>
  );
}