import { Component, Signal, createSignal } from 'solid-js';
import { TextField, IconButton, MenuItem, Select, Menu } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";
import { HiOutlineTrash } from 'solid-icons/hi';
import ParamSelect from './ParamSelect';

import { IChart } from '../../Api/Chart';
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
  const [select, setSelect] = createSignal('');

  return (
    <div class="mb-4 flex items-center space-x-2">
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
      <ParamSelect select={[select, setSelect]} params={[params, setParams]}></ParamSelect>
    </div>
  );
};

export default BoardChart;
