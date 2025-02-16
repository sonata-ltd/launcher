import { animate } from "motion";
import { Accessor, Component, createEffect, For, JSX } from "solid-js";
import { animationValues as av } from "../definitions";

import css from "./window.module.less";
import { debugComputation } from "@solid-devtools/logger";


type ContentStackProps = {
    index: Accessor<number>,
    prevIndex: number | undefined,
    children: JSX.Element[] | JSX.Element,
}

export const ContentStack: Component<ContentStackProps> = (props) => {
    let containerRef: HTMLElement | undefined = undefined;
    const childRefs: HTMLDivElement[] = [];

    let prevClientReactsheight = 0;
    let prevE: HTMLDivElement | undefined = undefined;

    createEffect(() => {
        // Get active element
        const e = childRefs[props.index()];

        // Enable accesibility for active element
        e.inert = false;

        // Get initial element
        const initialE = childRefs[0];

        // Get active element's dimensions
        const eClientReacts = e.getClientRects()[0];

        // Get initial element's dimensions
        const initialEClientReacts = initialE.getClientRects()[0];

        if (eClientReacts && initialEClientReacts) {

            if (containerRef) {

                // Animate scroll
                animate(
                    (containerRef as HTMLElement).scrollLeft,
                    eClientReacts.width * props.index(),
                    { ...av.defaultAnimationType, onUpdate: v => (containerRef as HTMLElement).scrollLeft = v}
                )

                // Use the height of initial (or first) element for animation;
                if (prevClientReactsheight === 0) {
                    prevClientReactsheight = initialEClientReacts.height;
                }

                // Animate container height
                animate(
                    containerRef,
                    { height: [prevClientReactsheight, eClientReacts.height] },
                    av.defaultAnimationType
                )
            }

            // Remember last element height for animation
            prevClientReactsheight = eClientReacts.height;

            // Disable accesibility to previous element
            if (typeof props.prevIndex === "number") {
                const prevE = childRefs[(props.prevIndex as number)];
                prevE.inert = true;
            }
        }
    })


    return (
        <>
            <div class={css["window-content"]} ref={containerRef}>
                <For each={props.children}>{(child, i) =>
                    <div
                        class={css["content"]}
                        ref={(e) => childRefs[i()] = e}
                        inert
                    >
                        {child}
                    </div>
                }</For>
            </div>
        </>
    )
}
