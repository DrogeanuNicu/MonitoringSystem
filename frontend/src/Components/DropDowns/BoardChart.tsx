import { Component, Signal } from 'solid-js';

import { IChart } from '../../Api/Chart';

interface BoardChartProps {
  signal: Signal<IChart>;
}

const BoardChart: Component<BoardChartProps> = (props) => {
  const [signal, setSignal] = props.signal;

  return (
    <div>
        <p>{signal().name}</p>
    </div>
  );
};

export default BoardChart;
