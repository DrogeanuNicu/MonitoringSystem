import { Slide } from "@suid/material";
import { TransitionProps } from "@suid/material/transitions";
import { JSXElement } from "solid-js";

const Transition = function Transition(
    props: TransitionProps & {
        children: JSXElement;
    }
) {
    return <Slide direction="up" {...props} />;
};

export default Transition;