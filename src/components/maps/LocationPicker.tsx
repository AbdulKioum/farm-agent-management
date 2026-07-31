import {
  MapContainer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import { useState } from "react";
import MapLayers from "./MapLayers";

type Props = {
  onSelect: (
    lat: number,
    lng: number
  ) => void;

  center?: [
    number,
    number
  ];

  zoom?: number;

  selectedPosition?: [
    number,
    number
  ] | null;

  markers?: React.ReactNode;
};


function LocationMarker({
  onSelect,
}: Props) {
  const [position, setPosition] =
    useState<any>(null);

  useMapEvents({
    click(e: any) {
      setPosition(
        e.latlng
      );

      onSelect(
        e.latlng.lat,
        e.latlng.lng
      );
    },
  });

  return position ? (
    <Marker
      position={position}
    />
  ) : null;
}

function ExistingMarker({
  position,
}: {
  position: [number, number];
}) {
  return (
    <Marker position={position} />
  );
}

export default function LocationPicker({
  onSelect,
  center = [23.8103, 90.4125],
  zoom = 8,
  selectedPosition,
  markers,
}: Props) {


  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{
        height: "450px",
        width: "100%",
      }}
    >
      const mapKey =
  import.meta.env
    .VITE_MAPTILER_KEY;

<MapLayers />

      {markers}

      {selectedPosition && (
  <ExistingMarker
    position={
      selectedPosition
    }
  />
)}

      <LocationMarker
        onSelect={
          onSelect
        }
      />
    </MapContainer>
  );
}