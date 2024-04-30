import { Component, Signal, createSignal } from 'solid-js';
import { TextField, IconButton, MenuItem, Select, FormControl, InputLabel, Button } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";
import { HiOutlineTrash } from 'solid-icons/hi';
import ParamSelect from './ParamSelect';
import ColorPicker from '../ColorPicker/ColorPicker';

import { IChartOySignals, IChartType, IChartOy, IChartSignals } from '../../Api/Chart';
import { IParameterSignals } from '../../Api/Parameter';

interface BoardChartProps {
  index: number;
  signal: IChartSignals;
  deleteCb: (index: number) => void;
  params: Signal<IParameterSignals[]>;
}

const BoardChart: Component<BoardChartProps> = (props) => {
  const [name, setName] = props.signal.Name;
  const [type, setType] = props.signal.Type;
  const [ox, setOx] = props.signal.Ox;
  const [oys, setOys] = props.signal.Oy;

  const paramSelectCb = (paramIndex: number, oyIndex?: number) => {
    if (oyIndex !== undefined) {
      oys()[oyIndex].Index[1](paramIndex);
    } else {
      setOx(paramIndex);
    }
  }

  const addOy = () => {
    setOys(prevOys => [...prevOys, IChartOySignals.create(IChartOy.create())]);
  };

  const deleteOy = (oyIndex: number) => {
    setOys(prevOys => prevOys.filter((_, index) => index !== oyIndex));
  };

  const populateOys = () => {
    const elements = [];

    for (let i = 0; i < oys().length; i++) {
      elements.push(
        <div class="flex items-center space-x-2">
          <ParamSelect
            oyIndex={i}
            label={`Oy-${i + 1}`}
            signal={oys()[i].Index}
            cb={paramSelectCb}
            params={props.params}></ParamSelect>
          <ColorPicker
            signal={oys()[i].Color}
          ></ColorPicker>
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
          value={name()}
          onChange={(e) => setName(e.target.value)}
        />
        <FormControl class="w-full" size="small">
          <InputLabel id="chart-type">Type</InputLabel>
          <Select
            labelId="chart-type"
            label="Type"
            value={type()}
            onChange={(e) => setType(e.target.value)}
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
        <ParamSelect label='Ox' signal={[ox, setOx]} cb={paramSelectCb} params={props.params}></ParamSelect>
      </div>
      <div class="mb-4 flex-col space-y-4">
        {populateOys()}
      </div>
      <div class="mb-4 flex justify-center text-main-color">
        <Button color="inherit" onClick={addOy}>Add Oy</Button>
      </div>
      <hr class="mb-4 border-2"></hr>
    </div >
  );
};

export default BoardChart;
