import { Accessor, children, Component, createEffect, createMemo, createSignal, For, onMount, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate, spring } from "motion";
import { animationValues as av } from '../definitions';

import css from "./window.module.less";
import Button from "../Button";
import { ButtonTypes } from "../Button/button";
import { useLogger } from "lib/logger";
import { Portal } from "solid-js/web";
import { Separator } from "../Separator/separator";


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
    detached?: boolean,
    sidebarChildren?: JSX.Element | JSX.Element[],
    headerButton?: JSX.Element,
    class?: string,
}

export const Window: Component<WindowProps> = (props) => {
    let localDetached = props.detached;
    let windowContentWrapper: HTMLDivElement | undefined = undefined;
    let windowHolder = document.getElementById("window-holder");

    createEffect(() => {
        if (windowContentWrapper && windowHolder) {
            const el = windowContentWrapper as HTMLDivElement;
            el.setAttribute("data-window-enabled", props.visible().toString());
            el.id = "window-wrapper_" + crypto.randomUUID();
        }
    })

    onMount(() => {
        if (!windowHolder) {
            localDetached = false;
            console.warn("Window Holder not found");
        }
    })


    return <>
        {localDetached ? (
            <Portal
                mount={windowHolder}
                ref={windowContentWrapper}
            >
                <WindowBase
                    {...props}
                />
            </Portal>
        ) : (
            <WindowBase {...props} />
        )}
    </>
}

const WindowBase: Component<WindowProps> = (props) => {
    const [{ log }] = useLogger();
    const resolvedChildres = children(() => props.children);
    const resolvedSidebarChildrens = children(() => props.sidebarChildren);

    const [loadInternalContent, setLoadInternalContent] = createSignal(props.visible());

    // Prevent window animation instantly after component render
    let enableAnims = false;
    let window: HTMLDivElement | undefined = undefined;

    createEffect(() => {
        if (window) {

            // Animate window opening
            if (props.visible()) {

                (window as HTMLDivElement).style.display = "flex";
                (window as HTMLDivElement).style.flexDirection = "column";
                setLoadInternalContent(true);

                animate(
                    window,
                    av.elementsPoints.window.open,
                    av.defaultAnimationType
                )

                enableAnims = true;

                // Animate window closing
            } else if (props.visible() === false && enableAnims !== false) {

                animate(
                    window,
                    av.elementsPoints.window.close,
                    av.defaultAnimationType
                ).then(() => {
                    (window as HTMLDivElement).style.display = "none";
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

    const windowControls = (): Element => {
        return (
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
        ) as Element;
    }


    return (
        <>
            <div
                class={css["window"]}
                classList={{
                    [props.class]: props.class
                }}
                style={`${props.width ? `max-width: ${props.width}px` : ``}`}
                ref={window}
            >
                <Show
                    when={!resolvedSidebarChildrens()}
                >
                    <WindowHeader name={props.name} changeVisibility={changeVisibility} />
                </Show>
                <div
                    classList={{
                        [css["horizontal-container"]]: resolvedSidebarChildrens()
                    }}
                >
                    <Show
                        when={resolvedSidebarChildrens()}
                    >
                        <>
                            {loadInternalContent() && (() => {
                                return resolvedSidebarChildrens();
                            })()}
                            <Separator vertical />
                        </>
                    </Show>
                    <div class={css["wrapper"]}>
                        <Show
                            when={resolvedSidebarChildrens()}
                        >
                            <WindowHeader name={props.name} changeVisibility={changeVisibility} />
                        </Show>
                        <div
                            class={css["main-container"]}
                        >
                            <Show
                                when={resolvedChildres()}
                                fallback={
                                    <div class={css["empty-message"]}>
                                        <p>Empty content...</p>
                                    </div>
                                }
                            >
                                {loadInternalContent() && (() => {
                                    return resolvedChildres();
                                })()}
                            </Show>
                        </div>
                        <div class={css["bottom-container"]}>
                            <Show when={props.controlsConfig && resolvedSidebarChildrens()}>
                                {windowControls()}
                            </Show>
                        </div>
                    </div>
                </div>
                <Show
                    when={!resolvedSidebarChildrens()}
                >
                    <Show when={props.controlsConfig}>
                        {windowControls()}
                    </Show>
                </Show>
            </div>
        </>
    )
}


interface WindowHeaderProps {
    name?: string | Accessor<string>,
    changeVisibility: () => void
}

const WindowHeader: Component<WindowHeaderProps> = (props) => {
    return (
        <>
            <div class={css["header"]}>
                <div class={css["name"]}>
                    <p>{props.name || props.name?.() || "Window"}</p>
                </div>
                <div class={css["controls-container"]}>
                    <div class={css["minimize"]}></div>
                    <div
                        class={css["close"]}
                        onClick={() => props.changeVisibility()}
                    ></div>
                </div>
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
    children: JSX.Element,
    alignTop?: boolean,
}

export const ContentWrapper = (props: ContentWrapperProps) => {
    return (
        <>
            <div
                class={css["window-content"]}
                classList={{
                    [css["align-top"]]: props.alignTop
                }}
            >
                <div class={css["content"]}>
                    {props.children}
                </div>
            </div>
        </>
    )
}
