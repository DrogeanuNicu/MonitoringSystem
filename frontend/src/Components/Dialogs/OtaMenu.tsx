import { Component, createSignal } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@suid/material";
import ErrorAlert from '../Alerts';
import { otaUpdateApi } from '../../Api/Board';

import Transition from './Transition';

interface OtaMenuProps {
  username: string;
  board: string;
  show: [() => boolean, (newValue: boolean) => void];
}

const OtaMenu: Component<OtaMenuProps> = (props) => {
  const [isOn, setIsOn] = props.show;
  const [error, setError] = createSignal('');
  const [file, setFile] = createSignal<File | null>(null);

  const handleClose = () => {
    setError('');
    setFile(null);
    setIsOn(false);
  };

  const handleUpdate = async () => {

    try {
      await otaUpdateApi(props.username, props.board, file());
      /* TODO: Add visual effect for the user */
      handleClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      setFile(target.files[0]);
    }
  };

  return (
    <div>
      <Dialog
        open={isOn()}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="ota-menu-dialog-slide"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>{`OTA Update ${props.board}`}</DialogTitle>
        <DialogContent>
          <input type="file" id="fileInput" onChange={handleFileChange} />


          <ErrorAlert errorMsg={[error, setError]}></ErrorAlert>
        </DialogContent>
        <DialogActions class="text-main-color">
          <Button color="inherit" onClick={handleUpdate}>Update</Button>
          <Button color="inherit" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OtaMenu;
