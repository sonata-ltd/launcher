import { children, createEffect, createSignal, For, JSX, onCleanup, ParentProps } from "solid-js";
import css from "./windowHolder.module.less";
import { animate, spring } from "motion";


const disabledBGColor = "rgba(0, 0, 0, 0)";
const enabledBGColor = "rgba(71, 75, 81, 0.3)";

export const childAttributeName = "data-window-enabled";

export const WindowHolder = (props: ParentProps) => {
    const [visibleWindows, setVisibleWindows] = createSignal(1);
    const [wrapperVisible, setWrapperVisible] = createSignal(false);

    let windowWrapper: HTMLDivElement | undefined;


    createEffect(() => {
        if (!windowWrapper) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    if (mutation.target instanceof HTMLDivElement) {
                        handleAttributeChange(mutation.target);
                    }
                }
            });
        });

        observer.observe(windowWrapper, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [childAttributeName]
        });

        onCleanup(() => {
            observer.disconnect();
        });
    });

    const handleAttributeChange = (target: HTMLDivElement) => {
        const attribute = target.attributes.getNamedItem(childAttributeName);
        if (!attribute) return;

        const attributeValue = attribute.value;

        if (attributeValue === "true") {
            setVisibleWindows((prev) => prev + 1);
        } else {
            setVisibleWindows((prev) => {
                if (prev <= 0) {
                    return 0;
                } else {
                    return prev - 1;
                }
            })
        }

        target.style.zIndex = visibleWindows().toString();
    }

    const animateBG = (show: boolean, fn?: () => void) => {
        if (!windowWrapper) return;

        console.log(show, "run");

        if (show) {
            console.log("show");
            animate(
                windowWrapper,
                { backgroundColor: [disabledBGColor, enabledBGColor] },
                { type: spring, bounce: 0, duration: 0.3 }
            ).then(() => {
                fn?.();
            })
        } else {
            console.log("hide");
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

        console.log(visibleWindows());

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

    createEffect(() => {
        console.log("Wrapper visible: ", wrapperVisible());
    })


    return (
        <div
            ref={windowWrapper}
            id="window-holder"
            class={css["wrapper"]}
        />
    );
};
