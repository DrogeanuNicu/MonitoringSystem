import { Component, Signal } from 'solid-js';
import { MenuItem, Select } from '@suid/material';
import { SelectChangeEvent } from "@suid/material/Select";

import { IParameter } from '../../Api/Parameter';

interface ParamSelectProps {
    select: Signal<string>;
    params: Signal<Signal<IParameter>[]>;
}

const ParamSelect: Component<ParamSelectProps> = (props) => {
    const [params, setParams] = props.params;
    const [select, setSelect] = props.select;

    const onSelectChange = (event: SelectChangeEvent) => {
        console.log(event.target.value);
        setSelect(event.target.value);
    };

    const populateMenu = () => {
        const elements = [];

        for (let i = 0; i < params().length; i++) {
            const [paramSignal, setParamSignal] = params()[i];
            if (paramSignal().name !== "") {
                elements.push(<MenuItem value={i} >{paramSignal().name}</MenuItem>)
            }
        }
        return elements;
    }

    return (
        <Select
            value={select()}
            onChange={onSelectChange}
        >
            {populateMenu()}
        </Select>
    );
};

export default ParamSelect;
