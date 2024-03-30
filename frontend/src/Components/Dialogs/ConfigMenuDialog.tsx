import { Component, createSignal, onMount } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import FormInputField from '../FormInputField';
import ErrorMessage from '../ErrorMessage';
import { BoardData } from '../../Api/Board';

import { authorizedFetch } from '../../Api/Fetch';

import Transition from './Transition';

interface ConfigMenuDialogProps {
  username: string;
  board: string | undefined;

  showBind: [() => boolean, (newValue: boolean) => void];
  callbackFunction: (newData: BoardData, oldBoardName?: string | undefined) => Promise<void>;
}

const ConfigMenuDialog: Component<ConfigMenuDialogProps> = (props) => {
  const [isOn, setIsOn] = props.showBind || createSignal(false);
  const [error, setError] = createSignal('');
  const [formBoardName, setFormBoardName] = createSignal('');

  const handleClose = () => {
    setError('');
    setIsOn(false);
  };

  const handleSubmit = async () => {
    let newData: BoardData = {
      board: formBoardName(),
    }

    try {
      await props.callbackFunction(newData, (props.board !== undefined) ? props.board : undefined);
      setIsOn(false);
    }
    catch (error: any) {
      setError(error.message);
    }
  };

  const loadData = async () => {
    if (props.board === undefined) {
      setFormBoardName('');
    }
    else {
      setFormBoardName(props.board);
      try {
        const response = await authorizedFetch(props.username, `/api/home/${props.username}/config/${props.board}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Could not communicate with the server!');
        }

        const boardData: BoardData = await response.json();
        console.log(boardData);

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
        <DialogTitle>{(props.board === undefined) ? "New Board" : props.board} Config</DialogTitle>
        <DialogContent>
          <FormInputField
            label="Name"
            type="text"
            minlength="3"
            maxlength="40"
            value={formBoardName()}
            hasVisibilityToggle={false}
            bind={[formBoardName, setFormBoardName]}></FormInputField>
          <ErrorMessage errorMsgBind={[error, setError]}></ErrorMessage>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleSubmit}>{(props.board === undefined) ? "Add" : "Edit"}</Button>
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfigMenuDialog;
