import { Component } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@suid/material";
import { createSignal } from "solid-js";
import ErrorAlert from '../Alerts';
import { deleteBoardApi } from '../../Api/Board';
import Transition from './Transition';

interface DeleteBoardProps {
  username: string;
  board: [() => string, (newValue: string) => void];
  cb: (board: string) => Promise<void>;
}

const DeleteBoard: Component<DeleteBoardProps> = (props) => {
  const [board, setBoard] = props.board;
  const [errorMessage, setErrorMessage] = createSignal('');

  const handleYes = async () => {
    try {
      await deleteBoardApi(props.username, board());
      await props.cb(board());
      handleClose();
    }
    catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleClose = () => {
    setBoard('');
  };

  return (
    <div>
      <Dialog
        open={(board() === '' || board() === undefined) ? false : true}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide"
        fullWidth
      >
        <DialogTitle>{`Delete the board '${board()}'?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-delete-dialog-slide-description">
            {`Do you really want to delete the board '${board()}'? All data will be lost.`}
          </DialogContentText>
        </DialogContent>
        <div class="p-5">
          <ErrorAlert errorMsg={[errorMessage, setErrorMessage]}></ErrorAlert>
        </div>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleYes}>Yes</Button>
          <Button color="inherit" onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteBoard;
