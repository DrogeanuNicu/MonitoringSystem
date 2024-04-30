import { Component, onMount, onCleanup } from 'solid-js';
import ApexCharts from 'apexcharts';
import { IGaugeSignals } from '../../../Api/Gauge';

interface DbGaugeProps {
  gauge: IGaugeSignals,
}

const DbGauge: Component<DbGaugeProps> = (props) => {
  const { Name: [name], Min: [min], Max: [max], Color: [color], Value: [value] } = props.gauge;

  const getGaugeDivId = () => `gauge-${name()}`;

  onMount(() => {
    const element = document.getElementById(getGaugeDivId());
    if (!element) return;

    const gaugeOptions = {
      chart: {
        type: "radialBar",
        height: 350,
        offsetX: 0,
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            margin: 0,
            size: "70%",
            background: "#fff",
            image: undefined,
            imageOffsetX: 0,
            imageOffsetY: 0,
            position: "front",
            dropShadow: {
              enabled: false,
              top: 0,
              left: 0,
              blur: 3,
              opacity: 0.5,
            }
          },
          track: {
            background: "#eee",
            strokeWidth: "67%",
            margin: 0,
          },
          dataLabels: {
            show: true,
            name: {
              offsetY: -10,
              show: true,
              color: "#888",
              fontSize: "17px",
            },
            value: {
              formatter: (val: number) => `${value()}`,
              color: "#111",
              fontSize: "30px",
              show: true,
            }
          }
        }
      },
      fill: {
        type: "solid",
        colors: [color()],
      },
      labels: [name()],
      series: [0],
    };

    props.gauge.Ref = new ApexCharts(element, gaugeOptions);
    props.gauge.Ref.render();

    onCleanup(() => props.gauge.Ref?.destroy());
  });

  return (
    <div class="p-3 shadow-md rounded-lg">
      <div id={getGaugeDivId()}></div>
      <div class="flex items-center justify-center space-x-10">
        <p>Min: {min()}</p>
        <p>Max: {max()}</p>
      </div>
    </div>
  );
};

export type { DbGaugeProps };
export default DbGauge;
