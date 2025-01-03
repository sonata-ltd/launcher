import { JSX } from "solid-js/jsx-runtime"

import css from "./window.module.less";


export interface IVerticalStack {
    children: JSX.Element[],
}

export const VerticalStack = (props: IVerticalStack) => {
    return (
        <>
            <div
                class={css["vertical-stack"]}
            >
                {props.children}
            </div>
        </>
    )
}
