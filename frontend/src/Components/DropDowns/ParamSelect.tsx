import { Component, createSignal, Signal, onMount } from 'solid-js';
import { MenuItem, Select, FormControl, InputLabel } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";

import { IParameter } from '../../Api/Parameter';
import { IChartOy } from '../../Api/Chart';

interface ParamSelectProps {
  params: Signal<Signal<IParameter>[]>;
  label: string;
  initIndex?: number;
  oyIndex?: number;
  cb: (paramIndex: number, oyIndex?: number) => void;
}

const ParamSelect: Component<ParamSelectProps> = (props) => {
  const [params, setParams] = props.params;
  const [signal, setSignal] = createSignal(0);

  const onSelectChange = (event: SelectChangeEvent) => {
    setSignal(parseInt(event.target.value));
    props.cb(signal(), props.oyIndex);
  };

  const populateMenu = () => {
    const elements = [];

    for (let i: number = 0; i < params().length; i++) {
      const [paramSignal, setParamSignal] = params()[i];
      if (paramSignal().name !== "") {
        elements.push(<MenuItem value={i} >{paramSignal().name}</MenuItem>)
      }
    }
    return elements;
  }

  const setInitIndex = () => {
    if (props.initIndex !== undefined) {
      if (props.initIndex < params().length) {
        setSignal(props.initIndex);
      }
    }
  }

  onMount(setInitIndex);

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
