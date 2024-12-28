import { Accessor, Component, createEffect, For, onMount, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate, spring } from "motion";
import { animationValues as av } from '../definitions';

import css from "./window.module.less";
import Button from "../Button";
import { ButtonTypes } from "../Button/button";
import Page from "pages/Instances/instances";


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
                    {console.log("children")}
                    {props.children}
                </Show>
                <Show when={props.controlsConfig}>
                    <div class={css.WindowControls}>
                        <For each={props.controlsConfig()}>{(button) =>
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
    let containerRef = undefined;
    const childRefs: HTMLDivElement[] = [];

    let prevClientReactsheight = 0;

    createEffect(() => {
        // Get active element
        const e = childRefs[props.index()];

        // Get active element's dimensions
        const eClientReacts = e.getClientRects()[0];

        if (eClientReacts) {

            if (containerRef) {

                // Animate scroll
                animate(
                    containerRef.scrollLeft,
                    eClientReacts.width * props.index(),
                    { ...av.defaultAnimationType, onUpdate: v => containerRef.scrollLeft = v}
                )

                // Animate container height
                animate(
                    containerRef,
                    { height: [prevClientReactsheight, eClientReacts.height] },
                    av.defaultAnimationType
                )
            }

            // Remember last element height for animation
            prevClientReactsheight = eClientReacts.height;
        }
    })

    return (
        <>
            <div class={css.WindowContent} ref={containerRef}>
                <For each={props.children}>{(child, i) =>
                    <div
                        class={css.Content}
                        ref={(e) => childRefs[i()] = e}
                    >
                        {child}
                    </div>
                }</For>
            </div>
        </>
    )
}
