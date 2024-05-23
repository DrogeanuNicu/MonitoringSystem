import { Component, createSignal, createEffect } from 'solid-js';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@suid/material";
import { ErrorAlert } from '../Alerts';
import { Alert } from "@suid/material"
import { Signal } from 'solid-js';
import { otaUpdateApi } from '../../Api/Board';
import { OtaStatus } from '../../Api/Board';
import { authorizedFetch } from '../../Api/Fetch';
import { CheckListItem } from '../Alerts';

import Transition from './Transition';
import { CircularProgress, Stack } from "@suid/material";

interface OtaMenuProps {
  username: string;
  board: string;
  show: [() => boolean, (newValue: boolean) => void];
  status: [() => number, (newValue: number) => void];
}

const OtaMenu: Component<OtaMenuProps> = (props) => {
  const [isOn, setIsOn] = props.show;
  const [status, setStatus] = props.status;
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [file, setFile] = createSignal<File | null>(null);
  const checks: Signal<boolean>[] = [];
  for (let i = 0; i < OtaStatus.LENGTH; i++) {
    checks.push(createSignal<boolean>(false));
  }

  const handleClose = () => {
    setError('');
    setIsOn(false);
    setStatus(OtaStatus.NO_STATUS);
    setLoading(false);
    authorizedFetch(props.username, `/api/${props.username}/reset/status/${props.board}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      await otaUpdateApi(props.username, props.board, file());
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      setFile(target.files[0]);
    }
  };

  createEffect(() => {
    for (let i = 0; i < OtaStatus.LENGTH; i++) {
      if (i <= status()) {
        checks[i][1](true);
      } else {
        checks[i][1](false);
      }
    }

    if (status() === OtaStatus.BOARD_REQUESTED_BIN) {
      handleClose();
    }
  });

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
        <DialogContent class="flex flex-col">
          <input class="block w-full text-lg cursor-pointer bg-teal-100 text-teal-600 dark:bg-teal-600 dark:text-white focus:outline-none dark:border-teal-600 dark:placeholder-teal-600 border-none" type="file" id="fileInput" onChange={handleFileChange} />

          <p class="text-lg font-semibold mt-4">Checklist:</p>
          <CheckListItem condition={checks[OtaStatus.BINARY_UPLOADED]} text="The binary has been uploaded to the server."></CheckListItem>
          <CheckListItem condition={checks[OtaStatus.MQTTS_MSG_SENT]} text="The validation token has been sent to the board via MQTTS."></CheckListItem>
          <CheckListItem condition={checks[OtaStatus.BOARD_REQUESTED_BIN]} text="The board has requested to download the binary."></CheckListItem>

          {(loading() && file() !== null) ? (
            <Stack class="text-main-color my-4 items-center justify-center" direction="row">
              <CircularProgress color="inherit" />
            </Stack>
          ) : (
            <></>
          )}

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
