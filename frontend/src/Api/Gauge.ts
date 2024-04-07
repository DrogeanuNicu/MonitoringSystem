import { Signal, createSignal } from 'solid-js';

interface IGauge {
  Name: string;
}

namespace IGauge {
  export function create(name: string = "gauge"): IGauge {
    return { Name: name };
  }
}

interface IGaugeSignals {
  Name: Signal<string>;
}

namespace IGaugeSignals {
  export function create(gauge: IGauge): IGaugeSignals {
    return {
      Name: createSignal(gauge.Name),
    };
  };

  export function get(paramSignals: IGaugeSignals): IGauge {
    return {
      Name: paramSignals.Name[0](),
    };
  };
}

export { IGauge, IGaugeSignals };