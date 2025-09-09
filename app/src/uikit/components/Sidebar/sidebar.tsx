import { JSX } from "solid-js";
import Button from "../Button";
import { ButtonSizes } from "../Button/button";
import css from "./sidebar.module.less";


interface SidebarProps {
    children: JSX.Element | JSX.Element[]
}

export const Sidebar = (props: SidebarProps) => {
    return (
        <>
            <div class={css["container"]}>
                {props.children}
            </div>
        </>
    )
}
