import { Component } from 'solid-js';
import { Alert } from "@suid/material"
import { CheckCircleOutline } from '@suid/icons-material';

interface CheckListItemProps {
    condition: [() => boolean, (newValue: boolean) => void];
    text: string;
}

const CheckListItem: Component<CheckListItemProps> = (props) => {
    const [condition, setCondition] = props.condition;

    return (
        <div class="my-1">
            {condition() ? (
                <Alert severity='success'>{props.text}</Alert>
            ) : (
                <Alert icon={false} severity='warning'>{props.text}</Alert>
            )}
        </div>
    );
};

export type { CheckListItemProps };
export default CheckListItem;
