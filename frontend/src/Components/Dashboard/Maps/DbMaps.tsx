import { Component } from 'solid-js';
import { Signal } from 'solid-js';

import { IParameterSignals } from '../../../Api/Parameter';
import DbMap from './DbMap';
import { IMapSignals } from '../../../Api/Map';

interface DbMapsProps {
  maps: Signal<IMapSignals[]>,
}

const DbMaps: Component<DbMapsProps> = (props) => {
  const [maps, setMaps] = props.maps;

  return (
    <div class="p-3 overflow-x-auto">
      {maps().map(map => (
        <DbMap map={map}></DbMap>
      ))}
    </div>
  );
};

export type { DbMapsProps };
export default DbMaps;
