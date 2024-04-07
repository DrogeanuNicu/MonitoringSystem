import { Component, Signal } from 'solid-js';

interface ColorPickerProps {
  oyIndex: number;
  signal: Signal<string>;
}

const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [color, setColor] = props.signal;

  return (
    <input
      type="color"
      value={color()}
      onChange={(e) => { setColor(String(e.target.value)) }}>
    </input>
  );
};

export type { ColorPickerProps };
export default ColorPicker;
