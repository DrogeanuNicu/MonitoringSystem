import { Component, createSignal, onMount, Signal, createEffect } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@suid/material";
import ErrorMessage from '../ErrorMessage';
import ShowHideToggle from '../ShowHideToggle';
import BoardParameter from '../Board/BoardParameter';

import { BoardConfig, Parameter } from '../../Api/Board';
import { getBoardConfig } from '../../Api/Board';

import Transition from './Transition';

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
  const [boardDesc, setBoardDesc] = createSignal('');
  const [toggleParams, setToggleParams] = createSignal(true);
  const [parameters, setParameters] = createSignal<Signal<Parameter>[]>([]);
  const [toggleCharts, setToggleCharts] = createSignal(true);
  const [toggleGauges, setToggleGauges] = createSignal(true);
  const [toggleMaps, setToggleMaps] = createSignal(true);

  const handleClose = () => {
    setError('');
    setBoardName('');
    setIsOn(false);
  };

  const addParameter = () => {
    setParameters(prevParams => [...prevParams, createSignal<Parameter>({ name: "", uom: "" })]);
  };

  const handleSubmit = async () => {
    let newConfig: BoardConfig = {
      board: boardName(),
      parameters: [],
    }

    try {
      /* TODO: add protobuf or something else for constants, types */
      if (newConfig.board.length > 20) {
        throw new Error("The length of the board's name cannot be bigger than 20!");
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
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  value={boardDesc()}
                  onChange={(e) => setBoardDesc(e.target.value)}
                />
              </div>
            </div>

            <ShowHideToggle text="Parameters" show={[toggleParams, setToggleParams]} />
            <div classList={{ 'hidden': !toggleParams() }} class="flex flex-col items-center">
              <div class="text-black">
                {parameters().map(paramSignal => (
                  <BoardParameter paramSignal={paramSignal} />
                ))}
              </div>
              <Button color="inherit" onClick={addParameter}>Add</Button>
            </div>

            <ShowHideToggle text="Charts" show={[toggleCharts, setToggleCharts]} />
            <div classList={{ 'hidden': !toggleCharts() }} class="flex flex-col items-center">
              <div class="text-black">
              </div>
              <Button color="inherit" >Add</Button>
            </div>

            <ShowHideToggle text="Gauges" show={[toggleGauges, setToggleGauges]} />
            <div classList={{ 'hidden': !toggleGauges() }} class="flex flex-col items-center">
              <div class="text-black">
              </div>
              <Button color="inherit" >Add</Button>
            </div>

            <ShowHideToggle text="Maps" show={[toggleMaps, setToggleMaps]} />
            <div classList={{ 'hidden': !toggleMaps() }} class="flex flex-col items-center">
              <div class="text-black">
              </div>
              <Button color="inherit" >Add</Button>
            </div>
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
