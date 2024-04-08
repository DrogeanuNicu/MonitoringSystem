import { Component } from 'solid-js';
import { Signal } from 'solid-js';

import { IParameterSignals } from '../../Api/Parameter';

interface TableProps {
  parameters: Signal<IParameterSignals[]>,
}

const Table: Component<TableProps> = (props) => {
  const [parameters, setParameters] = props.parameters;

  return (
    <div>
    </div>
  );
};

export type { TableProps };
export default Table;
