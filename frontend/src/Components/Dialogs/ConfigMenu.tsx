import { Component, createSignal, onMount, Signal, createEffect } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@suid/material";
import ErrorAlert from '../Alerts';
import ShowHideToggle from '../DropDowns/ShowHideToggle';
import { DropDownType } from '../DropDowns/DropDown';

import { BoardConfig } from '../../Api/Board';
import { IParameterSignals } from '../../Api/Parameter';
import { IChartSignals } from '../../Api/Chart';
import { IGaugeSignals } from '../../Api/Gauge';
import { IMapSignals } from '../../Api/Map';

import { getBoardConfig } from '../../Api/Board';

import Transition from './Transition';
import DropDown from '../DropDowns/DropDown';

interface ConfigMenuProps {
  username: string;
  board: string;

  show: [() => boolean, (newValue: boolean) => void];
  cb: (newConfig: BoardConfig, oldBoardName?: string | undefined) => Promise<void>;
}

const ConfigMenu: Component<ConfigMenuProps> = (props) => {
  const [isOn, setIsOn] = props.show;
  const [error, setError] = createSignal('');
  const [toggleDetails, setToggleDetails] = createSignal(true);
  const [boardName, setBoardName] = createSignal('');
  const [parameters, setParameters] = createSignal<IParameterSignals[]>([]);
  const [charts, setCharts] = createSignal<IChartSignals[]>([]);
  const [gauges, setGauges] = createSignal<IGaugeSignals[]>([]);
  const [maps, setMaps] = createSignal<IMapSignals[]>([]);

  const handleClose = () => {
    setError('');
    setBoardName('');
    setIsOn(false);
  };

  const handleSubmit = async () => {
    let newConfig: BoardConfig = {
      Board: boardName(),
      Parameters: [],
      Charts: [],
    };

    for (let i = 0; i < parameters().length; i++) {
      newConfig.Parameters.push(IParameterSignals.get(parameters()[i]));
    }

    for (let i = 0; i < charts().length; i++) {
      newConfig.Charts.push(IChartSignals.get(charts()[i]));
    }

    console.log(newConfig);

    try {
      /* TODO: Add more checks to be sure the data is correct before sending to the backend */
      /* TODO: add protobuf or something else for constants, types */
      if (newConfig.Board.length > 20) {
        throw new Error("The length of the board's name cannot be bigger than 20!");
      }

      if (newConfig.Board === "") {
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
      try {
        setBoardName(props.board);
        const config: BoardConfig = await getBoardConfig(props.username, props.board);

        let paramsSignals: IParameterSignals[] = [];
        for (let i = 0; i < config.Parameters.length; i++) {
          paramsSignals.push(IParameterSignals.create(config.Parameters[i]));
        }
        setParameters(paramsSignals);

        let chartsSignals: IChartSignals[] = [];
        for (let i = 0; i < config.Charts.length; i++) {
          chartsSignals.push(IChartSignals.create(config.Charts[i]));
        }
        setCharts(chartsSignals);

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

          <ErrorAlert errorMsg={[error, setError]}></ErrorAlert>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleSubmit}>{(props.board === '') ? "Add" : "Edit"}</Button>
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfigMenu;
