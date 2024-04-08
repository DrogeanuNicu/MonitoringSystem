import { Component } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import { createSignal } from "solid-js";
import ErrorAlert from '../Alerts';
import { ErrorAlertProps } from '../Alerts';

import Transition from './Transition';


const ErrorMessage: Component<ErrorAlertProps> = (props) => {
  const [error, setError] = props.errorMsg || createSignal('');

  const handleClose = () => {
    setError('');
  };

  return (
    <div>
      <Dialog
        open={(error() === '' || error() === undefined) ? false : true}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide"
        fullWidth
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-error-dialog-slide">
            <ErrorAlert errorMsg={[error, setError]}></ErrorAlert>
          </DialogContentText>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ErrorMessage;
