import { Component } from 'solid-js';

interface ColorPickerProps {
  oyIndex: number;
  initColor?: string;
  cb: (oyIndex: number, color: string) => void;
}

const ColorPicker: Component<ColorPickerProps> = (props) => {

  const handleColorChange = (event: any) => {
    props.cb(props.oyIndex, String(event.target.value));
  };

  return (
    <input type="color" value={props.initColor ?? "0xFFFFFF"} onChange={handleColorChange}></input>
  );
};

export type { ColorPickerProps };
export default ColorPicker;
