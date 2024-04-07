import { Component, Signal } from 'solid-js';

import { IMap } from '../../Api/Map';

interface BoardMapProps {
  signal: Signal<IMap>;
}

const BoardMap: Component<BoardMapProps> = (props) => {
  const [signal, setSignal] = props.signal;

  return (
    <div>
        <p>{signal().Name}</p>
    </div>
  );
};

export default BoardMap;
