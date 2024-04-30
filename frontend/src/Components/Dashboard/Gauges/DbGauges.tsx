import { Component, Signal } from 'solid-js';
import DbGauge from './DbGauge';
import { IGaugeSignals } from '../../../Api/Gauge';
import { IParameterSignals } from '../../../Api/Parameter';

interface DbGaugesProps {
  gauges: Signal<IGaugeSignals[]>,
  parameters: Signal<IParameterSignals[]>,
}

const DbGauges: Component<DbGaugesProps> = (props) => {
  const [gauges, setGauges] = props.gauges;

  return (
    <div class="p-3 overflow-x-auto">
      {gauges().map(gauge => (
        <DbGauge gauge={gauge}></DbGauge>
      ))}
    </div>
  );
};

export type { DbGaugesProps };
export default DbGauges;
