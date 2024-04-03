import { Component, Signal } from 'solid-js';
import { TextField } from '@suid/material';
import { HiOutlineTrash } from 'solid-icons/hi';
import { IconButton } from '@suid/material';

import { IParameter } from '../../Api/Parameter';

interface BoardParameterProps {
  index: number;
  signal: Signal<IParameter>;
  deleteCb: (index: number) => void;
}

const BoardParameter: Component<BoardParameterProps> = (props) => {
  const [signal, setSignal] = props.signal;

  return (
    <div draggable class="mb-4 flex items-center space-x-2">
      <TextField
        required
        label="Name"
        variant="outlined"
        fullWidth
        size="small"
        value={signal().name}
        onChange={(e) => setSignal({ ...signal(), name: e.target.value })}
      />
      <TextField
        label="Unit of measurement"
        variant="outlined"
        fullWidth
        multiline
        size="small"
        value={signal().uom}
        onChange={(e) => setSignal({ ...signal(), uom: e.target.value })}
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
  );
};

export default BoardParameter;
