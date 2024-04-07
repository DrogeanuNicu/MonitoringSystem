import { Component, Signal } from 'solid-js';
import { TextField } from '@suid/material';
import { HiOutlineTrash } from 'solid-icons/hi';
import { IconButton } from '@suid/material';

import { IParameter, IParameterSignals } from '../../Api/Parameter';

interface BoardParameterProps {
  index: number;
  signal: IParameterSignals;
  deleteCb: (index: number) => void;
}

const BoardParameter: Component<BoardParameterProps> = (props) => {
  const [name, setName] = props.signal.Name;
  const [uom, setUom] = props.signal.Uom;

  return (
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
      <TextField
        label="Unit of measurement"
        variant="outlined"
        fullWidth
        multiline
        size="small"
        value={uom()}
        onChange={(e) => setUom(e.target.value)}
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
