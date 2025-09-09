import { JSX } from "solid-js/jsx-runtime"

import css from "./window.module.less";


export interface IVerticalStack {
    children: JSX.Element | JSX.Element[],
    expand?: boolean
}

export const VerticalStack = (props: IVerticalStack) => {
    return (
        <>
            <div
                class={css["vertical-stack"]}
                classList={{
                    [css.expand]: props.expand,
                }}
            >
                {props.children}
            </div>
        </>
    )
}
