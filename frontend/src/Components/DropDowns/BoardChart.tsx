import { Component, Signal, createSignal } from 'solid-js';
import { TextField, IconButton, MenuItem, Select, FormControl, InputLabel, Button } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";
import { HiOutlineTrash } from 'solid-icons/hi';
import ParamSelect from './ParamSelect';
import ColorPicker from '../ColorPicker/ColorPicker';

import { IChart, IChartType, IChartOy } from '../../Api/Chart';
import { IParameter } from '../../Api/Parameter';

interface BoardChartProps {
  index: number;
  signal: Signal<IChart>;
  deleteCb: (index: number) => void;
  params: Signal<Signal<IParameter>[]>;
}

const BoardChart: Component<BoardChartProps> = (props) => {
  const [signal, setSignal] = props.signal;
  const [params, setParams] = props.params;
  const [oys, setOys] = createSignal<IChartOy[]>(signal().oy);

  const onTypeSelectChange = (event: SelectChangeEvent) => {
    setSignal({ ...signal(), type: event.target.value });
  };

  const onOxSelectChange = (paramIndex: number) => {
    setSignal({ ...signal(), ox: paramIndex });
  };

  const onOySelectChange = (paramIndex: number, oyIndex: number) => {
    const currOy = [...signal().oy];
    currOy[oyIndex] = { ...currOy[oyIndex], index: paramIndex };
    setSignal({ ...signal(), oy: currOy });
    setOys(signal().oy);
  };

  const paramSelectCb = (paramIndex: number, oyIndex?: number) => {
    if (oyIndex !== undefined) {
      onOySelectChange(paramIndex, oyIndex);
    } else {
      onOxSelectChange(paramIndex);
    }
  }

  const colorPickerCb = (oyIndex: number, color: string) => {
    const currOy = [...signal().oy];
    currOy[oyIndex] = { ...currOy[oyIndex], color: color };
    setSignal({ ...signal(), oy: currOy });
    setOys(signal().oy);
  };

  const addOy = () => {
    const currOy = [...signal().oy];
    const newOy = IChartOy.create();
    currOy.push(newOy);
    setSignal({ ...signal(), oy: currOy });
    setOys(signal().oy);
  };

  const deleteOy = (oyIndex: number) => {
    const currOy = [...signal().oy];
    currOy.splice(oyIndex, 1);
    setSignal({ ...signal(), oy: currOy });
    setOys(signal().oy);
  }

  const populateOys = () => {
    const elements = [];

    for (let i = 0; i < oys().length; i++) {
      elements.push(
        <div class="flex items-center space-x-2">
          <ParamSelect
            oyIndex={i}
            label={`Oy-${i + 1}`}
            initIndex={oys()[i].index}
            cb={paramSelectCb}
            params={[params, setParams]}></ParamSelect>
          <ColorPicker oyIndex={i} initColor={oys()[i].color} cb={colorPickerCb}></ColorPicker>
          <IconButton
            color="inherit"
            component="span"
            aria-haspopup="true"
            onClick={() => deleteOy(i)}
          >
            <HiOutlineTrash size={28} class="icon-main-color" />
          </IconButton>
        </div>
      )
    }
    return elements;
  };

  return (
    <div class-="mb-4 flex-col">
      <div class="mb-4 flex items-center space-x-2">
        <TextField
          required
          label="Name"
          variant="outlined"
          fullWidth
          size="small"
          value={signal().name}
          onChange={(e) => setSignal({ ...signal(), name: e.target.value })}
        />
        <FormControl class="w-full" size="small">
          <InputLabel id="chart-type">Type</InputLabel>
          <Select
            labelId="chart-type"
            label="Type"
            value={signal().type}
            onChange={onTypeSelectChange}
          >
            <MenuItem value={IChartType.LINE}>{IChartType.LINE}</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          color="inherit"
          component="span"
          aria-haspopup="true"
          onClick={() => props.deleteCb(props.index)}
        >
          <HiOutlineTrash size={28} class="icon-main-color" />
        </IconButton>
      </div>
      <div class="mb-4 flex items-center space-x-2 w-1/2">
        <ParamSelect label='Ox' cb={paramSelectCb} params={[params, setParams]}></ParamSelect>
      </div>
      <div class="mb-4 flex-col space-y-4">
        {populateOys()}
      </div>
      <div class="mb-4 flex justify-center text-main-color">
        <Button color="inherit" onClick={addOy}>Add Oy</Button>
      </div>
      <hr class="mb-4"></hr>
    </div >
  );
};

export default BoardChart;
