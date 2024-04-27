import { Component } from 'solid-js';
import { Signal } from 'solid-js';

import { IParameterSignals } from '../../../Api/Parameter';

interface DbTableRowProps {
  index: number,
  signal: IParameterSignals,
}

const DbTableRow: Component<DbTableRowProps> = (props) => {
  const [name, setName] = props.signal.Name;
  const [uom, setUom] = props.signal.Uom;
  const [value, setValue] = props.signal.Value;

  return (
    <tr class={props.index % 2 === 0 ? 'bg-gray-100' : 'bg-gray'}>
      <td class="px-5 py-3 whitespace-nowrap">
        {`${name()}${uom() ? ` [${uom()}]` : ''}`}
      </td>
      <td class="px-5 py-3 whitespace-nowrap">{value()}</td>
    </tr>
  );
};

export type { DbTableRowProps as TableProps };
export default DbTableRow;
