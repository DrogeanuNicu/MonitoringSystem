import { Component, Signal } from 'solid-js';

interface ColorPickerProps {
  signal: Signal<string>;
}

const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [color, setColor] = props.signal;

  return (
    <input
      type="color"
      value={color()}
      onChange={(e) => { setColor(String(e.target.value)) }}
      class="w-11 h-8 min-w-11 min-h-8"
    />
  );
};

export type { ColorPickerProps };
export default ColorPicker;
