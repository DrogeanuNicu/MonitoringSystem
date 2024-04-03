interface IGauge {
  name: string;
}

namespace IGauge {
  export function create(name: string = "gauge"): IGauge {
    return { name };
  }
}

export { IGauge };