import { Component, Signal } from 'solid-js';

import { IGauge, IGaugeSignals } from '../../Api/Gauge';
import { IParameterSignals } from '../../Api/Parameter';
import { IconButton, TextField } from '@suid/material';
import { HiOutlineTrash } from 'solid-icons/hi';
import ParamSelect from './ParamSelect';
import ColorPicker from '../ColorPicker/ColorPicker';

interface BoardGaugeProps {
  index: number;
  signal: IGaugeSignals;
  deleteCb: (index: number) => void;
  params: Signal<IParameterSignals[]>;
}

const BoardGauge: Component<BoardGaugeProps> = (props) => {
  const [name, setName] = props.signal.Name;
  const [index, setIndex] = props.signal.Index;
  const [min, setMin] = props.signal.Min;
  const [max, setMax] = props.signal.Max;
  const [color, setColor] = props.signal.Color;


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
        <ParamSelect label='Parameter' signal={[index, setIndex]} cb={() => { }} params={props.params}></ParamSelect>
        <IconButton
          id="add-board-button"
          color="inherit"
          component="span"
          aria-haspopup="true"
          onClick={() => props.deleteCb(props.index)}
        >
          <HiOutlineTrash size={28} class="icon-main-color" />
        </IconButton>
      </div>
      <div class="mb-4 flex items-center space-x-2">
        <TextField
          required
          label="Min"
          variant="outlined"
          fullWidth
          size="small"
          value={min()}
          onChange={(e) => setMin(parseFloat(e.target.value) || 0)}
        />
        <TextField
          required
          label="Max"
          variant="outlined"
          fullWidth
          size="small"
          value={max()}
          onChange={(e) => setMax(parseFloat(e.target.value) || 0)}
        />
        <ColorPicker
          signal={[color, setColor]}
        ></ColorPicker>
      </div>
      <hr class="mb-4 border-2"></hr>
    </div>
  );
};

export default BoardGauge;
