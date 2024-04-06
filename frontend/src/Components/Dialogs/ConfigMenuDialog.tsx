import { Component, createSignal, onMount, Signal, createEffect } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@suid/material";
import ErrorMessage from '../ErrorMessage';
import ShowHideToggle from '../DropDowns/ShowHideToggle';
import { DropDownType } from '../DropDowns/DropDown';

import { BoardConfig } from '../../Api/Board';
import { IParameter } from '../../Api/Parameter';
import { IChart } from '../../Api/Chart';
import { IGauge } from '../../Api/Gauge';
import { IMap } from '../../Api/Map';

import { getBoardConfig } from '../../Api/Board';

import Transition from './Transition';
import DropDown from '../DropDowns/DropDown';

interface ConfigMenuDialogProps {
  username: string;
  board: string;

  show: [() => boolean, (newValue: boolean) => void];
  cb: (newConfig: BoardConfig, oldBoardName?: string | undefined) => Promise<void>;
}

const ConfigMenuDialog: Component<ConfigMenuDialogProps> = (props) => {
  const [isOn, setIsOn] = props.show;
  const [error, setError] = createSignal('');
  const [toggleDetails, setToggleDetails] = createSignal(true);
  const [boardName, setBoardName] = createSignal('');
  const [parameters, setParameters] = createSignal<Signal<IParameter>[]>([]);
  const [charts, setCharts] = createSignal<Signal<IChart>[]>([]);
  const [gauges, setGauges] = createSignal<Signal<IGauge>[]>([]);
  const [maps, setMaps] = createSignal<Signal<IMap>[]>([]);

  const handleClose = () => {
    setError('');
    setBoardName('');
    setIsOn(false);
  };

  const handleSubmit = async () => {
    let newConfig: BoardConfig = {
      board: boardName(),
      parameters: [],
      charts: [],
    };

    for (let i = 0; i < parameters().length; i++) {
      const [x, setX] = parameters()[i];
      newConfig.parameters.push(x());
    }
    
    for (let i = 0; i < charts().length; i++) {
      const [x, setX] = charts()[i];
      newConfig.charts.push(x());
    }

    console.log(newConfig);

    try {
      /* TODO: Add more checks to be sure the data is correct before sending to the backend */
      /* TODO: add protobuf or something else for constants, types */
      if (newConfig.board.length > 20) {
        throw new Error("The length of the board's name cannot be bigger than 20!");
      }

      if (newConfig.board === "") {
        throw new Error("The board's name cannot be empty!");
      }

      await props.cb(newConfig, (props.board !== '') ? props.board : undefined);
      handleClose();
    }
    catch (error: any) {
      setError(error.message);
    }
  };

  const loadData = async () => {
    if (props.board === '') {
      setBoardName('');
    }
    else {
      setBoardName(props.board);
      try {
        const config: BoardConfig = await getBoardConfig(props.username, props.board);
        console.log(config);
      } catch (error: any) {
        setError(error.message);
      }
    }
  }

  onMount(loadData);

  return (
    <div>
      <Dialog
        open={isOn()}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="config-menu-dialog-slide"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>{(props.board === '') ? "New Board" : props.board} Config</DialogTitle>
        <DialogContent>

          <div class="text-main-color">
            <ShowHideToggle text="Details" show={[toggleDetails, setToggleDetails]} />
            <div classList={{ 'hidden': !toggleDetails(), 'text-black': true }}>
              <div class="flex justify-between space-x-1">
                <TextField
                  required
                  label="Name"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={boardName()}
                  onChange={(e) => setBoardName(e.target.value)}
                />
              </div>
            </div>

            <DropDown name="Parameters" type={DropDownType.PARAMETERS} signals={[parameters, setParameters]} ></DropDown>
            <DropDown name="Charts" type={DropDownType.CHARTS} signals={[charts, setCharts]} params={[parameters, setParameters]} ></DropDown>
            <DropDown name="Gauges" type={DropDownType.GAUGES} signals={[gauges, setGauges]} ></DropDown>
            <DropDown name="Maps" type={DropDownType.MAPS} signals={[maps, setMaps]} ></DropDown>
          </div>

          <ErrorMessage errorMsg={[error, setError]}></ErrorMessage>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleSubmit}>{(props.board === '') ? "Add" : "Edit"}</Button>
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfigMenuDialog;
