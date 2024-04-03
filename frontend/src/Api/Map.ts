interface IMap {
  name: string;
}

namespace IMap {
  export function create(name: string = "map"): IMap {
    return { name };
  }
}

export { IMap };