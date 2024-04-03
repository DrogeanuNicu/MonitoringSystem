import { Component, Signal } from 'solid-js';

import { IGauge } from '../../Api/Gauge';

interface BoardGaugeProps {
  signal: Signal<IGauge>;
}

const BoardGauge: Component<BoardGaugeProps> = (props) => {
  const [signal, setSignal] = props.signal;

  return (
    <div>
        <p>{signal().name}</p>
    </div>
  );
};

export default BoardGauge;
