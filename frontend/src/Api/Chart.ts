enum IChartType {
  LINE = "line",
}

interface IChartOy {
  index: number;
  color: string;
}

namespace IChartOy {
  export function create(index: number = 0, color: string = ""): IChartOy {
    return {
      index: index,
      color: color,
    };
  }
}

interface IChart {
  name: string;
  type: string;
  ox: number;
  oy: IChartOy[];
}

namespace IChart {
  export function create(name: string = "chart", type: IChartType = IChartType.LINE, ox: number = 0, oy: IChartOy[] = []): IChart {
    return {
      name: name,
      type: type,
      ox: ox,
      oy: oy,
    };
  }
}

export { IChart, IChartType, IChartOy };