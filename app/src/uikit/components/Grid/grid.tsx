import { Component } from "solid-js"
import css from "./grid.module.less";

type GridProps = {
    children?: any
}

const Grid: Component<GridProps> = (props) => {
    return (
        <>
            <div class={css.GridComponent}>
            </div>
        </>
    )
}


const GridChildren: Component = () => {
    return (
        <>
        </>
    )
}
