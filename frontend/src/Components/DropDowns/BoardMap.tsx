import { Component, Signal } from 'solid-js';

import { IMap, IMapSignals } from '../../Api/Map';
import { IParameterSignals } from '../../Api/Parameter';
import { IconButton, TextField } from '@suid/material';
import ParamSelect from './ParamSelect';
import { HiOutlineTrash } from 'solid-icons/hi';

interface BoardMapProps {
  index: number;
  signal: IMapSignals;
  deleteCb: (index: number) => void;
  params: Signal<IParameterSignals[]>;
}

const BoardMap: Component<BoardMapProps> = (props) => {
  const [name, setName] = props.signal.Name;
  const [Lon, setLon] = props.signal.Lon;
  const [Lat, setLat] = props.signal.Lat;
  const [Alt, setAlt] = props.signal.Alt;


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
        <IconButton
          color="inherit"
          component="span"
          aria-haspopup="true"
          onClick={() => props.deleteCb(props.index)}
        >
          <HiOutlineTrash size={28} class="icon-main-color" />
        </IconButton>
      </div>
      <div class="mb-4 flex-col space-y-4">
        <div class="flex items-center space-x-2">
          <ParamSelect label='Longitude' signal={[Lon, setLon]} cb={() => { }} params={props.params}></ParamSelect>
        </div>
        <div class="flex items-center space-x-2">
          <ParamSelect label='Latitude' signal={[Lat, setLat]} cb={() => { }} params={props.params}></ParamSelect>
        </div>
        <div class="flex items-center space-x-2">
          <ParamSelect label='Altitude' signal={[Alt, setAlt]} cb={() => { }} params={props.params}></ParamSelect>
        </div>
      </div>
    </div>
  );
};

export default BoardMap;
