import { Component, Signal, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import Chart, { ChartData, ChartOptions } from 'chart.js/auto';
import { IChartSignals } from '../../../Api/Chart';
import { IParameterSignals } from '../../../Api/Parameter';
import { TextField } from '@suid/material';

interface DbLineChartProps {
  chart: IChartSignals,
  parameters: Signal<IParameterSignals[]>,
}

const DbLineChart: Component<DbLineChartProps> = (props) => {
  const [parameters, setParameters] = props.parameters;
  const [name, setName] = props.chart.Name;
  const [Ox, setOx] = props.chart.Ox;
  const [Oy, setOy] = props.chart.Oy;

  let canvasRef: any;

  onMount(() => {
    if (canvasRef) {
      const ctx = canvasRef.getContext('2d');
      const data: ChartData = {
        labels: [],
        datasets: [],
      };

      for (let i = 0; i < Oy().length; i++) {
        data.datasets.push({
          label: parameters()[Oy()[i].Index[0]()].Name[0](),
          data: [],
          fill: false,
          borderColor: Oy()[i].Color[0](),
          tension: 0.1,
        });
      }

      const chartOptions: ChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: name(),
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: parameters()[Ox()].Name[0](),
            },
            beginAtZero: true,
          },
        },
      };

      props.chart.Ref = new Chart(ctx, {
        type: 'line',
        data: data,
        options: chartOptions,
      });
    }
  });

  return (
    <div class="p-3 shadow-md rounded-lg">
      <div class="mb-2">
        <canvas ref={canvasRef} width={400} height={400} />
      </div>
      <div class="flex flex-wrap justify-center mx-auto">
        {Oy().map((oy) => (
          <div class="p-2 flex-grow min-w-[100px] max-w-[200px]">
            <TextField
              type="number"
              label={parameters()[oy.Index[0]()].Name[0]()}
              variant="outlined"
              fullWidth
              size="small"
              inputProps={{ step: 0.1 }}
              value={oy.Scale[0]().toString()}
              onChange={(e) => oy.Scale[1](parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export type { DbLineChartProps };
export default DbLineChart;
