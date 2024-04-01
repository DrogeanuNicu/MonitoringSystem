import { Component, createSignal, onMount } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import FormInputField from '../FormInputField';
import ErrorMessage from '../ErrorMessage';
import { BoardConfig } from '../../Api/Board';
import { getBoardConfig } from '../../Api/Board';
import { authorizedFetch, } from '../../Api/Fetch';

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
  const [boardName, setBoardName] = createSignal('');

  const handleClose = () => {
    setError('');
    setBoardName('');
    setIsOn(false);
  };

  const handleSubmit = async () => {
    let newConfig: BoardConfig = {
      board: boardName(),
    }

    try {
      /* TODO: add protobuf constants, types */
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
      >
        <DialogTitle>{(props.board === '') ? "New Board" : props.board} Config</DialogTitle>
        <DialogContent>
          <FormInputField
            label="Name"
            type="text"
            minlength="3"
            maxlength="40"
            value={boardName()}
            hasVisibilityToggle={false}
            bind={[boardName, setBoardName]}></FormInputField>
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
