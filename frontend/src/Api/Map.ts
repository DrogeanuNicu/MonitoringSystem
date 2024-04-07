import { Signal, createSignal } from 'solid-js';

interface IMap {
  Name: string;
}

namespace IMap {
  export function create(name: string = "map"): IMap {
    return { Name: name };
  }
}

interface IMapSignals {
  Name: Signal<string>;
}

namespace IMapSignals {
  export function create(gauge: IMap): IMapSignals {
    return {
      Name: createSignal(gauge.Name),
    };
  };

  export function get(paramSignals: IMapSignals): IMap {
    return {
      Name: paramSignals.Name[0](),
    };
  };
}

export { IMap, IMapSignals };