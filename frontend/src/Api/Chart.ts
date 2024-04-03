interface IChart {
  name: string;
}

namespace IChart {
  export function create(name: string = "chart"): IChart {
    return { name };
  }
}

export { IChart };