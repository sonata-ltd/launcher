import { children, createEffect, createSignal, For, JSX, onCleanup, ParentProps } from "solid-js";
import css from "./windowHolder.module.less";
import { animate, spring } from "motion";
import { createStore } from "solid-js/store";


const disabledBGColor = "rgba(0, 0, 0, 0)";
const enabledBGColor = "rgba(71, 75, 81, 0.3)";

export const childAttributeName = "data-window-enabled";

type WindowObject = {
    id: string,
    enabled: boolean
}

export const WindowHolder = (props: ParentProps) => {
    const [properties, setProperties] = createStore({
        lastZIndex: 0,
        visibleWindows: 0,
        windowObjects: [],
    })

    const [visibleWindows, setVisibleWindows] = createSignal(properties.visibleWindows);
    const [windowObjects, setWindowObjects] = createSignal<WindowObject[]>(properties.windowObjects);

    const [wrapperVisible, setWrapperVisible] = createSignal(false);
    const childObservers = new WeakMap<HTMLElement, MutationObserver>();

    let windowWrapper: HTMLDivElement | undefined;


    createEffect(() => {
        if (!windowWrapper) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLDivElement) {
                        const childObserver = new MutationObserver((childMutations) => {
                            childMutations.forEach((childMutation) => {
                                if (childMutation.type === "attributes") {
                                    handleAttributeChange(childMutation.target as HTMLDivElement);
                                }
                            })
                        })

                        childObserver.observe(node, {
                            attributes: true,
                            attributeFilter: [childAttributeName],
                            subtree: false
                        })

                        childObservers.set(node, childObserver);

                        handleNodeAdd(node);
                    }
                })

                mutation.removedNodes.forEach((node) => {
                    if (node instanceof HTMLDivElement ) {
                        const observer = childObservers.get(node);

                        if (observer) {
                            observer.disconnect()
                            childObservers.delete(node);
                        }

                        handleNodeRemove(node);
                    }
                });
            });
        });

        observer.observe(windowWrapper, {
            childList: true,
            subtree: false,
        });

        onCleanup(() => {
            observer.disconnect();
        });
    });

    const handleNodeAdd = (target: HTMLDivElement) => {
        const id = target.id;

        const attributeValue = target.getAttribute(childAttributeName);
        let enabled = false;

        if (attributeValue === "true") {
            enabled = true;

            setProperties("lastZIndex", (prev) => prev + 1);
            setVisibleWindows((prev) => prev + 1);
            target.style.zIndex = properties.lastZIndex.toString();
        }

        // setWindowObjects((prev) => [
        //     ...prev,
        //     {
        //         id,
        //         enabled
        //     }
        // ])
    }

    const handleNodeRemove = (target: HTMLDivElement) => {
        // setWindowObjects((prev) => prev.filter((e) => e.id !== target.id));

        if (target.getAttribute(childAttributeName) === "true") {
            setProperties("lastZIndex", (prev) => prev - 1);
            setVisibleWindows((prev) => prev - 1);
        }
    }

    const handleAttributeChange = (target: HTMLDivElement) => {
        const attributeValue = target.getAttribute(childAttributeName);

        if (attributeValue === "true") {
            setVisibleWindows((prev) => prev + 1);
            // setWindowObjects((prev) =>
            //     prev.map((e) =>
            //         e.id === target.id ? { ...e, enabled: true } : e
            //     )
            // );
        } else if (attributeValue === "false") {
            setVisibleWindows((prev) => prev - 1);
            // setWindowObjects((prev) =>
            //     prev.map((e) =>
            //         e.id === target.id ? { ...e, enabled: false } : e
            //     )
            // );
        }

        target.style.zIndex = visibleWindows().toString();
    }

    const animateBG = (show: boolean, fn?: () => void) => {
        if (!windowWrapper) return;

        if (show) {
            animate(
                windowWrapper,
                { backgroundColor: [disabledBGColor, enabledBGColor] },
                { type: spring, bounce: 0, duration: 0.3 }
            ).then(() => {
                fn?.();
            })
        } else {
            animate(
                windowWrapper,
                { backgroundColor: [enabledBGColor, disabledBGColor] },
                { type: spring, bounce: 0, duration: 0.3 }
            ).then(() => {
                fn?.();
            })
        }
    }

    createEffect(() => {
        if (!windowWrapper) return;

        if (visibleWindows() <= 0 && wrapperVisible()) {
            setWrapperVisible(false);
            animateBG(false, () => {
                windowWrapper.style.display = "none";
            })
        } else if (visibleWindows() > 0 && !wrapperVisible()) {
            setWrapperVisible(true);
            windowWrapper.style.display = "block";
            animateBG(true);
        }
    })


    return (
        <div
            ref={windowWrapper}
            id="window-holder"
            class={css["wrapper"]}
        />
    );
};
