import { Signal, createSignal } from 'solid-js';

interface IParameter {
  Name: string;
  Uom: string;
}

namespace IParameter {
  export function create(name: string = "", uom: string = ""): IParameter {
    return {
      Name: name,
      Uom: uom
    };
  };
}

interface IParameterSignals {
  Name: Signal<string>;
  Uom: Signal<string>;
  Value: Signal<string>;
}

namespace IParameterSignals {
  export function create(param: IParameter): IParameterSignals {
    return {
      Name: createSignal(param.Name),
      Uom: createSignal(param.Uom),
      Value: createSignal(""),
    };
  };

  export function get(paramSignals: IParameterSignals): IParameter {
    return {
      Name: paramSignals.Name[0](),
      Uom: paramSignals.Uom[0](),
    };
  };
}

export { IParameter, IParameterSignals };