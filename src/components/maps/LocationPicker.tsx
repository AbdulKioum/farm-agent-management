import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import {
  useState,
} from "react";

type Props = {
  onSelect: (
    lat: number,
    lng: number
  ) => void;
};

function LocationMarker({
  onSelect,
}: Props) {
  const [position, setPosition] =
    useState<any>(null);

  useMapEvents({
    click(e) {
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

export default function LocationPicker({
  onSelect,
}: Props) {
  return (
    <MapContainer
      center={[
        23.8103,
        90.4125,
      ]}
      zoom={8}
      style={{
        height: "450px",
        width: "100%",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        onSelect={
          onSelect
        }
      />
    </MapContainer>
  );
}