import { Component } from 'solid-js';
import { Signal } from 'solid-js';

import { IChartSignals } from '../../../Api/Chart';
import { IParameterSignals } from '../../../Api/Parameter';
import DbLineChart from './DbLineChart';

interface DbChartsProps {
  charts: Signal<IChartSignals[]>,
  parameters: Signal<IParameterSignals[]>,
}

const DbCharts: Component<DbChartsProps> = (props) => {
  const [parameters, setParameters] = props.parameters;
  const [charts, setCharts] = props.charts;

  return (
    <div class="p-3 overflow-x-auto">
      {charts().map(chart => (
        <DbLineChart chart={chart} parameters={[parameters, setParameters]}></DbLineChart>
      ))}
    </div>
  );
};

export type { DbChartsProps };
export default DbCharts;
