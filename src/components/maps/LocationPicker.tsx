import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import { useState } from "react";

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
  center = [
    23.8103,
    90.4125,
  ],
  zoom = 8,
  selectedPosition,
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
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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