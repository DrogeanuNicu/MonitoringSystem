import { Component, onMount } from 'solid-js';
import { IMapSignals } from '../../../Api/Map';
import { Switch } from "@suid/material";

import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import markerIcon from "../../../../node_modules/leaflet/dist/images/marker-icon.png";


interface DbMapProps {
  map: IMapSignals,
}

const DbMap: Component<DbMapProps> = (props) => {
  const [name, setName] = props.map.Name;
  const [Lon, setLon] = props.map.Lon;
  const [Lat, setLat] = props.map.Lat;
  const [Alt, setAlt] = props.map.Alt;
  const [Live, setLive] = props.map.Live;

  const getLatLng = (): L.LatLng => {
    return L.latLng(Lat(), Lon(), Alt(),
    );
  }

  onMount(() => {
    const initCoords: L.LatLng = L.latLng(0, 0, 0);

    L.Marker.prototype.setIcon(L.icon({
      iconUrl: markerIcon
    }))

    props.map.Ref = L.map(name()).setView(initCoords, 0);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 5,
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(props.map.Ref);

    props.map.Marker = L.marker(initCoords);
    props.map.Ref.addLayer(props.map.Marker);
    props.map.Marker.bindPopup(`Lat: ${initCoords.lat}, Lon: ${initCoords.lng}, Alt: ${initCoords.alt}`);
  });

  return (
    <div class="p-3 shadow-md rounded-lg">
      {/* TODO: adds check at submit for duplicated maps names */}
      <div id={name()} style="height:400px">
      </div>
      <div class="flex flex-row items-center justify-center">
        <p class="mr-1">Live</p>
        <Switch
          checked={Live()}
          onChange={(event, value) => {
            setLive(value);
          }}
        />
      </div>
    </div>
  );
};

export type { DbMapProps };
export default DbMap;
