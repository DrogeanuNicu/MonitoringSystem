import { Signal, createSignal } from 'solid-js';

interface IGauge {
  Name: string;
  Index: number;
  Min: number;
  Max: number;
  Color: string;
}

namespace IGauge {
  export function create(name: string = "", index: number = 0, min: number = 0, max: number = 1, color: string = "0xFFFFFF"): IGauge {
    return {
      Name: name,
      Index: index,
      Min: min,
      Max: max,
      Color: color,
    };
  }
}

interface IGaugeSignals {
  Name: Signal<string>;
  Index: Signal<number>;
  Min: Signal<number>;
  Max: Signal<number>;
  Color: Signal<string>;
  Value: Signal<number>;
  Ref: ApexCharts | undefined;
}

namespace IGaugeSignals {
  export function create(gauge: IGauge): IGaugeSignals {
    return {
      Name: createSignal(gauge.Name),
      Index: createSignal(gauge.Index),
      Min: createSignal(gauge.Min),
      Max: createSignal(gauge.Max),
      Color: createSignal(gauge.Color),
      Value: createSignal(gauge.Min),
      Ref: undefined,
    };
  };

  export function get(gaugeSignals: IGaugeSignals): IGauge {
    return {
      Name: gaugeSignals.Name[0](),
      Index: gaugeSignals.Index[0](),
      Min: gaugeSignals.Min[0](),
      Max: gaugeSignals.Max[0](),
      Color: gaugeSignals.Color[0](),
    };
  };
}

export { IGauge, IGaugeSignals };