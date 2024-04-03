interface IParameter {
  name: string;
  uom: string;
}

namespace IParameter {
  export function create(name: string = "", uom: string = ""): IParameter {
    return { name, uom };
  }
}

export { IParameter };