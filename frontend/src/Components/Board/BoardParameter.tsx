import { Component, Signal } from 'solid-js';

import { Parameter } from '../../Api/Board';

interface BoardParameterProps {
    paramSignal: Signal<Parameter>;
}

const BoardParameter: Component<BoardParameterProps> = (props) => {
    const [parameter, setParameter] = props.paramSignal;

    return (
        <div>
            <p>{parameter().name} aaa</p>
        </div>
    );
};

export default BoardParameter;
