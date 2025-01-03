import { Accessor, Component, createEffect, For, onMount, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate, spring } from "motion";
import { animationValues as av } from '../definitions';

import css from "./window.module.less";
import Button from "../Button";
import { ButtonTypes } from "../Button/button";


export type ButtonConfig = {
    label: string,
    action: () => void,
    type?: ButtonTypes
}

type WindowProps = {
    visible: Accessor<boolean>,
    setVisible: Setter<boolean>,
    controlsConfig?: Accessor<ButtonConfig[]>
    children?: JSX.Element,
}

export const Window: Component<WindowProps> = (props) => {
    // Prevent window animation instantly after component render
    let enableAnims = false;
    let window: HTMLDivElement | undefined = undefined;

    createEffect(() => {
        if (window) {

            // Animate window closing
            if (props.visible()) {
                window.style.display = "block";

                animate(
                    window,
                    av.elementsPoints.window.open,
                    av.defaultAnimationType
                )

                enableAnims = true;

            // Animate window opening
            } else if (props.visible() === false && enableAnims !== false) {
                animate(
                    window,
                    av.elementsPoints.window.close,
                    av.defaultAnimationType
                ).then(() => {
                    window.style.display = "none";
                })
            }
        }
    })

    const changeVisibility = () => {
        props.setVisible(false);
    }


    return (
        <>
            <div
                class={css["window"]}
                ref={window}
            >
                <div class={css["header"]}>
                    <div class={css["name"]}>
                        <p>Instance Creation</p>
                    </div>
                    <div class={css["controls-container"]}>
                        <div class={css["minimize"]}></div>
                        <div
                            class={css["close"]}
                            onClick={() => changeVisibility()}
                        ></div>
                    </div>
                </div>
                <Show
                    when={props.children}
                    fallback={
                        <div class={css["empty-message"]}>
                            <p>Empty content...</p>
                        </div>
                    }
                >
                    {props.children}
                </Show>
                <Show when={props.controlsConfig}>
                    <div class={css["window-controls"]}>
                        <For each={props.controlsConfig?.()}>{(button) =>
                            <Button
                                type={button.type}
                                onClick={button.action}
                            >
                                {button.label}
                            </Button>
                        }</For>
                    </div>
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
        <div class={css["window-controls"]}>
            {props.children}
        </div>
    )
}
