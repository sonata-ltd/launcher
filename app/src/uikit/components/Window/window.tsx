import { Accessor, Component, createEffect, For, onMount, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate, spring } from "motion";
import { animationValues as av } from '../definitions';

import css from "./window.module.less";
import Button from "../Button";
import { ButtonTypes } from "../Button/button";
import { createOverlayScrollbars, OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { OverlayScrollbars } from "overlayscrollbars";
import { useLogger } from "lib/logger";


export type ButtonConfig = {
    label: string,
    action: () => void,
    type?: ButtonTypes
}

type WindowProps = {
    visible: Accessor<boolean>,
    setVisible: Setter<boolean>,
    controlsConfig?: Accessor<ButtonConfig[]>,
    name?: string | Accessor<string>,
    width?: number,
    children?: JSX.Element,
}

export const Window: Component<WindowProps> = (props) => {
    const [{ logw }] = useLogger();

    // Prevent window animation instantly after component render
    let enableAnims = false;
    let window: HTMLDivElement | undefined = undefined;
    let windowContentWrapper: HTMLDivElement | undefined = undefined;

    createEffect(() => {
        if (window) {

            // Animate window opening
            if (props.visible()) {
                console.log("Animate opening");

                window.style.display = "block";

                animate(
                    window,
                    av.elementsPoints.window.open,
                    av.defaultAnimationType
                )

                enableAnims = true;

            // Animate window closing
            } else if (props.visible() === false && enableAnims !== false) {
                console.log("Animate closing");

                animate(
                    window,
                    av.elementsPoints.window.close,
                    av.defaultAnimationType
                ).then(() => {
                    window.style.display = "none";
                })
            }
        } else {
            //logw("")
            console.warn("Not found");
        }
    })

    const changeVisibility = () => {
        props.setVisible(false);
    }


    return (
        <>
            <div
                class={css["window"]}
                style={`${props.width ? `max-width: ${props.width}px` : ``}`}
                ref={window}
            >
                <div class={css["header"]}>
                    <div class={css["name"]}>
                        <p>{props.name || props.name?.() || "Window"}</p>
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


type ContentWrapperProps = {
    children: JSX.Element
}

export const ContentWrapper = (props: ContentWrapperProps) => {
    return (
        <>
            <div class={css["window-content"]}>
                <div class={css["content"]}>
                    {props.children}
                </div>
            </div>
        </>
    )
}
