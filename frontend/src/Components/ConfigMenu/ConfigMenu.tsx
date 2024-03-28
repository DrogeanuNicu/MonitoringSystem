import { Component, createSignal, onMount } from 'solid-js';
import { IconButton, Backdrop } from '@suid/material';
import useTheme from "@suid/material/styles/useTheme";

import FormInputField from '../FormInputField';
import ErrorMessage from '../ErrorMessage';
import { BoardData } from '../../Api/Board';

import { HiSolidXCircle } from "solid-icons/hi";

interface ConfigMenuProps {
  data: BoardData | undefined;

  hideBind: [() => boolean, (newValue: boolean) => void];
  callbackFunction: (newData: BoardData, oldBoardName?: string | undefined) => Promise<void>;
}

const ConfigMenu: Component<ConfigMenuProps> = (props) => {
  const theme = useTheme();
  const [isOn, setIsOn] = props.hideBind || createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal('');
  const [formBoardName, setFormBoardName] = createSignal('');

  const handleMenuClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    let newData: BoardData = {
      board: formBoardName(),
    }

    try {
      await props.callbackFunction(newData, (props.data !== undefined) ? props.data.board : undefined);
      setIsOn(false);
    }
    catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const loadData = () => {
    /*TODO: Load data here into the form fields*/
    if (props.data !== undefined) {
      setFormBoardName(props.data.board);
    }
  }

  onMount(loadData);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: theme.zIndex.drawer + 1 }}
      open={isOn()}
      onClick={() => setIsOn(false)}
    >
      <div class="fixed top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-md shadow-md text-black" onClick={handleMenuClick}>
        <div class="flex items-center justify-between">
          <p class="p-2">{(props.data === undefined) ? "New Board" : props.data.board} Config</p>
          <div class="relative">
            <IconButton
              id="hide-config-menu"
              color="inherit"
              component="span"
              aria-haspopup="true"
              onClick={() => setIsOn(false)}
            >
              <HiSolidXCircle size={32} class="icon-main-color" />
            </IconButton>
          </div>
        </div>
        <div class="p-5">
          <form onSubmit={handleSubmit}>
            <FormInputField
              label="Name"
              type="text"
              minlength="3"
              maxlength="40"
              value={formBoardName()}
              hasVisibilityToggle={false}
              bind={[formBoardName, setFormBoardName]}></FormInputField>
            <ErrorMessage errorSignalBind={[errorMessage, setErrorMessage]} />
            <button type="submit" class="submit-button">{(props.data === undefined) ? "Add" : "Edit"}</button>
          </form>
        </div>

      </div>
    </Backdrop>
  );
};

export type { ConfigMenuProps };
export default ConfigMenu;
