import { Component } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import { createSignal } from "solid-js";
import ErrorMessage from '../ErrorMessage';

import Transition from './Transition';

interface AlarmDialogProps {
  showBind: [() => string, (newValue: string) => void];
  callbackFunction: (boardToBeDeleted: string) => Promise<void>;
}

const DeleteBoardDialog: Component<AlarmDialogProps> = (props) => {
  const [boardToBeDeleted, setBoardToBeDeleted] = props.showBind || createSignal('');
  const [errorMessage, setErrorMessage] = createSignal('');

  const handleYes = async () => {
    try {
      await props.callbackFunction(boardToBeDeleted());
      handleClose();
    }
    catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleClose = () => {
    setBoardToBeDeleted('');
  };

  return (
    <div>
      <Dialog
        open={(boardToBeDeleted() !== '' || boardToBeDeleted() !== undefined) ? true : false}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{`Delete the board '${boardToBeDeleted()}'?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-delete-dialog-slide-description">
            {`Do you really want to delete the board '${boardToBeDeleted()}'? All data will be lost.`}
          </DialogContentText>
        </DialogContent>
        <div class="p-5">
          <ErrorMessage errorSignalBind={[errorMessage, setErrorMessage]}></ErrorMessage>
        </div>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleYes}>Yes</Button>
          <Button color="inherit" onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteBoardDialog;
