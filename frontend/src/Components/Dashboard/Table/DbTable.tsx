import { Component } from 'solid-js';
import { Signal } from 'solid-js';

import { IParameterSignals } from '../../../Api/Parameter';
import DbTableRow from './TableRow';

interface DbTableProps {
  parameters: Signal<IParameterSignals[]>,
}

const DbTable: Component<DbTableProps> = (props) => {
  const [parameters, setParameters] = props.parameters;

  return (
    <div class="p-3 overflow-x-auto">
      <table class="table-auto min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-md">
        <thead class="main-color text-white">
          <tr>
            <th class="px-6 py-3 text-left uppercase tracking-wider">Parameter</th>
            <th class="px-6 py-3 text-left uppercase tracking-wider">Value</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {parameters().map((parameter, index) => (
            <DbTableRow index={index} signal={parameter}></DbTableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export type { DbTableProps };
export default DbTable;
