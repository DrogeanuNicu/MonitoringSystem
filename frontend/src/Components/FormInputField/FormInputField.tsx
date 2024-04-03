import { Component, createSignal } from 'solid-js';
import { Input, InputLabel, InputAdornment, IconButton, FormControl } from '@suid/material';

import { HiSolidEye, HiSolidEyeSlash } from "solid-icons/hi";
import "../../Styles/index.css";

const FormInputField = (props: any) => {
  const [value, setValue] = props.signal || createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  return (
    <div class="mb-2">
      <InputLabel class="text-left block mb-1">{props.label}</InputLabel>
      {props.hasVisibilityToggle ? (
        <Input class="w-full input-field"
          value={value()}
          onChange={(e) => setValue(e.target.value)}
          {...props}
          type={showPassword() ? 'text' : 'password'}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
              >
                {showPassword() ? <HiSolidEye size={24} class="icon-main-color" /> : <HiSolidEyeSlash size={24} class="icon-main-color" />}
              </IconButton>
            </InputAdornment>
          }
        />
      ) : (
        <Input class="w-full input-field"
          value={value()}
          onChange={(e) => setValue(e.target.value)}
          minlength="3"
          maxlength="8"
          {...props}
        />
      )
      }
    </div >
  );
};

export default FormInputField;
