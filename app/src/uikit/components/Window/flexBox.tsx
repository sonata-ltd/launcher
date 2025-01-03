import { JSX } from "solid-js/jsx-runtime"

import css from "./window.module.less";


export interface IFlexBox {
    expand?: boolean,
    children: JSX.Element | JSX.Element[],
}

export const FlexBox = (props: IFlexBox) => {
    return (
        <>
            <div
                class={css.flexbox}
                classList={{
                    [css.expand]: props.expand
                }}
            >
                {props.children}
            </div>
        </>
    )
}
