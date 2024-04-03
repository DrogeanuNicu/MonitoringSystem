import { Component } from "solid-js";
import { Button } from "@suid/material";

import { HiOutlineChevronDoubleDown, HiOutlineChevronDoubleRight } from "solid-icons/hi";

interface ShowHideToggleProps {
    text: string;
    show: [() => boolean, (newValue: boolean) => void];
}

const ShowHideToggle: Component<ShowHideToggleProps> = (props) => {
    const [show, setShow] = props.show;

    return (
        <Button color="inherit" class="w-full" onClick={() => setShow(!show())}>
            <p class="inline-block">{props.text}</p>
            <hr class="inline-block mx-4 w-full" />
            <div class="arrow-container">
                {show()
                    ? <HiOutlineChevronDoubleDown size={24} class="icon-main-color ml-auto" />
                    : <HiOutlineChevronDoubleRight size={24} class="icon-main-color ml-auto" />
                }
            </div>
        </Button>
    );
};

export default ShowHideToggle;
