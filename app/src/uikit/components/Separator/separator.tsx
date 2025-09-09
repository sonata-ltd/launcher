import { Component } from "solid-js";
import css from "./separator.module.less";


interface SeparatorProps {
    vertical?: boolean,
    rounded?: boolean
}

export const Separator: Component<SeparatorProps> = (props) => {
    return (
        <div
            class={css.separator}
            classList={{
                [css.vertical]: props.vertical,
                [css.rounded]: props.rounded
            }}
        ></div>
    )
}
