import { Component, Signal, createSignal } from 'solid-js';
import ShowHideToggle from './ShowHideToggle';
import { Button } from '@suid/material';

import { IParameter, IParameterSignals } from '../../Api/Parameter';
import BoardParameter from './BoardParameter';
import { IChart, IChartSignals } from '../../Api/Chart';
import BoardChart from './BoardChart';
import { IGauge, IGaugeSignals } from '../../Api/Gauge';
import BoardGauge from './BoardGauge';
import { IMap, IMapSignals } from '../../Api/Map';
import BoardMap from './BoardMap';

enum DropDownType {
  PARAMETERS,
  CHARTS,
  GAUGES,
  MAPS,
}

interface DropDownProps {
  name: string;
  type: DropDownType;
  signals: Signal<any[]>;
  params?: Signal<IParameterSignals[]>;
}

const DropDown: Component<DropDownProps> = (props) => {
  const [signals, setSignals] = props.signals;
  const [params, setParams] = props.params ?? createSignal<IParameterSignals[]>([]);
  const [toggle, setToggle] = createSignal(true);

  const addSignal = () => {
    switch (props.type) {
      case DropDownType.PARAMETERS:
        setSignals([...signals(), IParameterSignals.create(IParameter.create())]);
        break;
      case DropDownType.CHARTS:
        setSignals([...signals(), IChartSignals.create(IChart.create())]);
        break;
      case DropDownType.GAUGES:
        setSignals([...signals(), IGaugeSignals.create(IGauge.create())]);
        break;
      case DropDownType.MAPS:
        setSignals([...signals(), IMapSignals.create(IMap.create())]);
        break;
      default:
        break;
    }
  };

  const deleteSignal = (index: number) => {
    setSignals(() => {
      const updatedSignals = [...signals()];
      updatedSignals.splice(index, 1);
      return updatedSignals;
    });
  };

  const populateMenu = () => {
    const elements = [];

    for (let i = 0; i < signals().length; i++) {
      switch (props.type) {
        case DropDownType.PARAMETERS:
          elements.push(
            <BoardParameter
              index={i}
              signal={signals()[i]}
              deleteCb={deleteSignal}
            />);
          break;
        case DropDownType.CHARTS:
          if (params !== undefined) {
            elements.push(
              <BoardChart
                index={i}
                signal={signals()[i]}
                deleteCb={deleteSignal}
                params={[params, setParams]}
              />);
          }
          break;
        case DropDownType.GAUGES:
          if (params !== undefined) {
            elements.push(
              <BoardGauge
                index={i}
                signal={signals()[i]}
                deleteCb={deleteSignal}
                params={[params, setParams]}
              />);
          }
          break;
        case DropDownType.MAPS:
          if (params !== undefined) {
            elements.push(
              <BoardMap
                index={i}
                signal={signals()[i]}
                deleteCb={deleteSignal}
                params={[params, setParams]}
              />);
          }
          break;
        default:
          break;
      }
    }

    return elements;
  };

  return (
    <div>
      <ShowHideToggle text={props.name} show={[toggle, setToggle]} />
      <div classList={{ 'hidden': !toggle() }} class="flex flex-col items-center">
        <div class="text-black w-full">
          {populateMenu()}
        </div>
        <Button color="inherit" onClick={addSignal}>Add</Button>
      </div>
    </div>
  );
};

export { DropDownType }
export default DropDown;
