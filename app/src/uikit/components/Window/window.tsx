import { Accessor, Component, createEffect, For, onMount, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate } from "motion";
import { animationValues as av } from '../definitions';

import css from "./window.module.less";
import Button from "../Button";


type WindowProps = {
    visible: Accessor<boolean>,
    setVisible: Setter<boolean>,
    children?: JSX.Element
}

export const Window: Component<WindowProps> = (props) => {
    // Prevent window animation instantly after component render
    let enableAnims = false;
    let window: HTMLDivElement;

    createEffect(() => {
        if (props.visible()) {
            window.style.display = "block";

            animate(
                window,
                av.elementsPoints.window.open,
                av.defaultAnimationType
            )

            enableAnims = true;
        } else if (props.visible() === false && enableAnims !== false) {
            animate(
                window,
                av.elementsPoints.window.close,
                av.defaultAnimationType
            ).then(() => {
                window.style.display = "none";
            })
        }
    })

    const changeVisibility = () => {
        props.setVisible(false);
    }


    return (
        <>
            <div
                class={css.Window}
                ref={window}
            >
                <div class={css.Header}>
                    <div class={css.Name}>
                        <p>Instance Creation</p>
                    </div>
                    <div class={css.ControlsContainer}>
                        <div class={css.Minimize}></div>
                        <div
                            class={css.Close}
                            onClick={() => changeVisibility()}
                        ></div>
                    </div>
                </div>
                <Show
                    when={props.children}
                    fallback={
                        <div class={css.EmptyMessage}>
                            <p>Empty content...</p>
                        </div>
                    }
                >
                    {props.children}
                </Show>
            </div>
        </>
    )
}


type WindowControlsType = {
    children: JSX.Element
}

export const WindowControls: Component<WindowControlsType> = (props) => {
    return (
        <div class={css.WindowControls}>
            {props.children}
        </div>
    )
}


type ContentStackProps = {
    index: Accessor<number>
    children: JSX.Element[],
}

export const ContentStack: Component<ContentStackProps> = (props) => {
    createEffect(() => {
        console.log(props.index());
    })

    return (
        <>
            <div class={css.WindowContent}>
                <For each={props.children}>{(child, i) =>
                    <div class={css.Content}>
                        {child}
                    </div>
                }</For>
            </div>
        </>
    )
}
