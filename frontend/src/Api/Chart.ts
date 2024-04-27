import { Signal, createSignal } from 'solid-js';

enum IChartType {
  LINE = "line",
}

interface IChartOy {
  Index: number;
  Color: string;
}

namespace IChartOy {
  export function create(index: number = 0, color: string = "0xFFFFFF"): IChartOy {
    return {
      Index: index,
      Color: color,
    };
  }
}

interface IChartOySignals {
  Index: Signal<number>;
  Color: Signal<string>;
}

namespace IChartOySignals {
  export function create(oy: IChartOy): IChartOySignals {
    return {
      Index: createSignal(oy.Index),
      Color: createSignal(oy.Color),
    };
  };

  export function get(oySignal: IChartOySignals): IChartOy {
    return {
      Index: oySignal.Index[0](),
      Color: oySignal.Color[0](),
    };
  };
}

interface IChart {
  Name: string;
  Type: string;
  Ox: number;
  Oy: IChartOy[];
}

namespace IChart {
  export function create(name: string = "chart", type: IChartType = IChartType.LINE, ox: number = 0, oy: IChartOy[] = []): IChart {
    return {
      Name: name,
      Type: type,
      Ox: ox,
      Oy: oy,
    };
  };
}

interface IChartSignals {
  Name: Signal<string>;
  Type: Signal<string>;
  Ox: Signal<number>;
  Oy: Signal<IChartOySignals[]>;
  OxDataSet: Signal<string[]>;
  OyDataSets: Signal<number[]>[];
}

namespace IChartSignals {
  export function create(chart: IChart): IChartSignals {
    let oySignals: IChartOySignals[] = [];
    let oyDataSets: Signal<number[]>[] = [];
    for (let i = 0; i < chart.Oy.length; i++) {
      oySignals.push(IChartOySignals.create(chart.Oy[i]));
      oyDataSets.push(createSignal<number[]>([]));  
    }

    return {
      Name: createSignal(chart.Name),
      Type: createSignal(chart.Type),
      Ox: createSignal(chart.Ox),
      Oy: createSignal(oySignals),
      OxDataSet: createSignal<string[]>([]),
      OyDataSets: oyDataSets,
    };
  };

  export function get(chartSignals: IChartSignals): IChart {
    let oys: IChartOy[] = [];
    for (let i = 0; i < chartSignals.Oy[0]().length; i++) {
      oys.push(IChartOySignals.get(chartSignals.Oy[0]()[i]));
    }

    return {
      Name: chartSignals.Name[0](),
      Type: chartSignals.Type[0](),
      Ox: chartSignals.Ox[0](),
      Oy: oys,
    };
  };
}

export { IChart, IChartSignals, IChartType, IChartOy, IChartOySignals };