import { Component } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import { createSignal } from "solid-js";
import ErrorMessage from '../ErrorMessage';
import { ErrorMessageProps } from '../ErrorMessage';

import Transition from './Transition';


const ErrorMessageDialog: Component<ErrorMessageProps> = (props) => {
  const [error, setError] = props.errorSignalBind || createSignal('');

  const handleClose = () => {
    setError('');
    console.log((error() === '' || error() === undefined) ? false : true);
  };

  return (
    <div>
      <Dialog
        open={(error() === '' || error() === undefined) ? false : true}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-error-dialog-slide">
            <ErrorMessage errorSignalBind={[error, setError]}></ErrorMessage>
          </DialogContentText>
        </DialogContent>
        <DialogActions class="text-main-color flex items-center justify-between">
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ErrorMessageDialog;
