import { Component, createEffect, createSignal } from 'solid-js';
import { Signal } from 'solid-js';

import { onMount } from 'solid-js'
import { Chart, LineController, Title, Tooltip, Legend, Colors, ChartData, ChartOptions } from 'chart.js'
import { Line } from 'solid-chartjs'

import { IChartSignals } from '../../../Api/Chart';
import { IParameterSignals } from '../../../Api/Parameter';

interface DbLineChartProps {
  chart: IChartSignals,
  parameters: Signal<IParameterSignals[]>,
}

const DbLineChart: Component<DbLineChartProps> = (props) => {
  const [parameters, setParameters] = props.parameters;
  const [name, setName] = props.chart.Name;
  const [Ox, setOx] = props.chart.Ox;
  const [Oy, setOy] = props.chart.Oy;
  const [type, setType] = props.chart.Type;
  const [oxDataSet, setOxDataSet] = props.chart.OxDataSet;
  const oyDataSets = props.chart.OyDataSets;
  const [chartData, setChartData] = createSignal<ChartData>({
    labels: oxDataSet(),
    datasets: [],
  });
  let chartOptions: ChartOptions;

  chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  }

  let newChartData = chartData();
  for (let i = 0; i < Oy().length; i++) {
    newChartData.datasets.push({
      label: parameters()[i].Name[0](),
      data: oyDataSets[i][0](),
      borderColor: Oy()[i].Color[0](),
    });
  }
  setChartData(newChartData);

  createEffect(() => {
    console.log(`chart effect: ${oxDataSet()}\n`);
    const newData = {
      labels: oxDataSet(),
      datasets: oyDataSets.map((oyDataSet, i) => ({
        label: parameters()[i].Name[0](),
        data: oyDataSet[0](),
        borderColor: Oy()[i].Color[0](),
      })),
    };
    setChartData(newData);
  });

  onMount(() => {
    Chart.register(LineController, Title, Tooltip, Legend, Colors)
  })

  return (
    <div class="p-3 shadow-md rounded-lg">
      <Line data={chartData()} options={chartOptions} width={500} height={500} />
    </div>
  );
};

export type { DbLineChartProps };
export default DbLineChart;
