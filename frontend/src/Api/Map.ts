import { LatLng } from 'leaflet';
import { Signal, createSignal } from 'solid-js';

interface IMap {
  Name: string;
  Lon: number;
  Lat: number;
  Alt: number;
}

namespace IMap {
  export function create(name: string = "", Lon: number = 0, Lat: number = 0, Alt: number = 0): IMap {
    return {
      Name: name,
      Lon: Lon,
      Lat: Lat,
      Alt: Alt,
    };
  }
}

interface IMapSignals {
  Name: Signal<string>;
  Lon: Signal<number>;
  Lat: Signal<number>;
  Alt: Signal<number>;
  Ref: L.Map | undefined;
  Marker: L.Marker | undefined;
  Live: Signal<boolean>;
}

namespace IMapSignals {
  export function create(map: IMap): IMapSignals {
    return {
      Name: createSignal(map.Name),
      Lon: createSignal(map.Lon),
      Lat: createSignal(map.Lat),
      Alt: createSignal(map.Alt),
      Ref: undefined,
      Marker: undefined,
      Live: createSignal(true),
    };
  };

  export function get(mapSignals: IMapSignals): IMap {
    return {
      Name: mapSignals.Name[0](),
      Lon: mapSignals.Lon[0](),
      Lat: mapSignals.Lat[0](),
      Alt: mapSignals.Alt[0](),
    };
  };
}

export { IMap, IMapSignals };