import { createSignal } from 'solid-js';

import { HiSolidEye, HiSolidEyeSlash } from "solid-icons/hi";
import "../../Styles/index.css";


const FormInputField = (props) => {
  const [value, setValue] = props.bind || createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  return (
    <div class="mb-2">
      <label class="text-left block mb-1">{props.label}</label>
      {props.hasVisibilityToggle ? (
        <div class="relative">
          <input type={showPassword() ? 'text' : 'password'} onChange={(e) => setValue(e.target.value)} class="w-full input-field pr-10" required {...props} />
          <button type="button" class="absolute top-0 right-0 mt-2 mr-2" onClick={togglePasswordVisibility}>
            {showPassword() ? (
              <HiSolidEye size={24} class="icon-main-color" />
            ) : (
              <HiSolidEyeSlash size={24} class="icon-main-color" />
            )}
          </button>
        </div>
      ) : (
        <input value={value()} onInput={(e) => setValue(e.target.value)} class="w-full input-field" required {...props} />
      )
      }
    </div >
  );
};

export default FormInputField;
