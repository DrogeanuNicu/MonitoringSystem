import { Component, createSignal, onMount, Signal, createEffect } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@suid/material";
import { ErrorAlert } from '../Alerts';
import ShowHideToggle from '../DropDowns/ShowHideToggle';
import { DropDownType } from '../DropDowns/DropDown';
import { Checkbox } from "@suid/material";

import { BoardConfig, loadConfigApi } from '../../Api/Board';
import { IParameterSignals } from '../../Api/Parameter';
import { IChartSignals } from '../../Api/Chart';
import { IGaugeSignals } from '../../Api/Gauge';
import { IMapSignals } from '../../Api/Map';

import Transition from './Transition';
import DropDown from '../DropDowns/DropDown';

interface ConfigMenuProps {
  username: string;
  board: string;

  show: [() => boolean, (newValue: boolean) => void];
  cb: (newConfig: BoardConfig, oldBoardName?: string | undefined, deleteStoredData?: boolean) => Promise<void>;
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
  const [maxElemsPerChart, setMaxElemsPerChart] = createSignal(20);
  const [deleteStoredData, setDeleteStoredData] = createSignal(false);

  const handleClose = () => {
    setError('');
    setBoardName('');
    setIsOn(false);
  };

  const handleSubmit = async () => {
    let newConfig: BoardConfig = {
      Board: boardName(),
      MaxElemsPerChart: maxElemsPerChart(),
      Parameters: [],
      Charts: [],
      Maps: [],
      Gauges: [],
    };

    for (let i = 0; i < parameters().length; i++) {
      newConfig.Parameters.push(IParameterSignals.get(parameters()[i]));
    }

    for (let i = 0; i < maps().length; i++) {
      newConfig.Maps.push(IMapSignals.get(maps()[i]));
    }

    for (let i = 0; i < charts().length; i++) {
      newConfig.Charts.push(IChartSignals.get(charts()[i]));
    }

    for (let i = 0; i < gauges().length; i++) {
      newConfig.Gauges.push(IGaugeSignals.get(gauges()[i]));
    }

    try {
      /* TODO: Add more checks to be sure the data is correct before sending to the backend */
      /* TODO: Add types for parameters, because only numbers can be used as oy data for charts, ox can use strings */
      /* TODO: add protobuf or something else for constants, types */
      if (newConfig.Board.length > 20) {
        throw new Error("The length of the board's name cannot be bigger than 20!");
      }

      if (newConfig.Board === "") {
        throw new Error("The board's name cannot be empty!");
      }

      if (typeof newConfig.MaxElemsPerChart !== 'number' || isNaN(newConfig.MaxElemsPerChart)) {
        throw new Error("The maximum elements per chart has to be a number!");
      }

      if (newConfig.MaxElemsPerChart < 1) {
        throw new Error("The maximum elements per chart has to be a number greater than 0!");
      }

      if (newConfig.Parameters.length < 1) {
        throw new Error("You need to define at least one parameter!");
      }

      if (props.board !== "") {
        if (newConfig.Board !== props.board && deleteStoredData() === false) {
          throw new Error("Changing the name of the board means that all collected data has to be deleted! Check the box to continue!");
        }
      }


      await props.cb(newConfig, (props.board !== '') ? props.board : undefined, deleteStoredData());
      handleClose();
    }
    catch (error: any) {
      setError(error.message);
    }
  };

  const loadConfig = async () => {
    setBoardName(props.board);

    if (props.board !== "" && props.board !== undefined) {
      try {
        await loadConfigApi(
          props.username,
          props.board,
          [maxElemsPerChart, setMaxElemsPerChart],
          [parameters, setParameters],
          [charts, setCharts],
          [gauges, setGauges],
          [maps, setMaps]
        )
      } catch (error: any) {
        setError(error.message);
      }
    }
  }

  onMount(loadConfig);

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
                <TextField
                  required
                  label="Max elements per chart in live mode"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={maxElemsPerChart()}
                  onChange={(e) => setMaxElemsPerChart(Number(e.target.value))}
                />
              </div>
            </div>

            <DropDown name="Parameters" type={DropDownType.PARAMETERS} signals={[parameters, setParameters]} ></DropDown>
            <DropDown name="Maps" type={DropDownType.MAPS} signals={[maps, setMaps]} params={[parameters, setParameters]} ></DropDown>
            <DropDown name="Charts" type={DropDownType.CHARTS} signals={[charts, setCharts]} params={[parameters, setParameters]} ></DropDown>
            <DropDown name="Gauges" type={DropDownType.GAUGES} signals={[gauges, setGauges]} params={[parameters, setParameters]} ></DropDown>
          </div>

          {props.board !== '' && (
            <div class="flex items-center">
              <p class="mr-2">Delete the already collected data?</p>
              <Checkbox
                checked={deleteStoredData()}
                onChange={(event, checked) => {
                  setDeleteStoredData(checked);
                }}
                inputProps={{ "aria-label": "controlled" }}
                class="custom-checkbox"
              />
            </div>
          )}
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
