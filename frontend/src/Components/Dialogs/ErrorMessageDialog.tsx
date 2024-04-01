import { Component } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import { createSignal } from "solid-js";
import ErrorMessage from '../ErrorMessage';
import { ErrorMessageProps } from '../ErrorMessage';

import Transition from './Transition';


const ErrorMessageDialog: Component<ErrorMessageProps> = (props) => {
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
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-error-dialog-slide">
            <ErrorMessage errorMsg={[error, setError]}></ErrorMessage>
          </DialogContentText>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ErrorMessageDialog;
