import { Component, Signal } from 'solid-js';
import { MenuItem, Select, FormControl, InputLabel } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";

import { IParameterSignals } from '../../Api/Parameter';

interface ParamSelectProps {
  params: Signal<IParameterSignals[]>;
  signal: Signal<number>
  label: string;
  oyIndex?: number;
  cb: (paramIndex: number, oyIndex?: number) => void;
}

const ParamSelect: Component<ParamSelectProps> = (props) => {
  const [params, setParams] = props.params;
  const [signal, setSignal] = props.signal;

  const onSelectChange = (event: SelectChangeEvent) => {
    setSignal(parseInt(event.target.value));
    props.cb(signal(), props.oyIndex);
  };

  const populateMenu = () => {
    const elements = [];

    for (let i: number = 0; i < params().length; i++) {
      if (params()[i].Name[0]() !== "") {
        elements.push(<MenuItem value={i} >{params()[i].Name[0]()}</MenuItem>)
      }
    }
    return elements;
  }

  return (
    <FormControl class="w-full" size="small">
      <InputLabel id={props.label}>{props.label}</InputLabel>
      <Select
        labelId={props.label}
        label={props.label}
        value={signal()}
        onChange={onSelectChange}
      >
        {populateMenu()}
      </Select>
    </FormControl>
  );
};

export default ParamSelect;
