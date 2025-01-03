import { animate } from "motion";
import { Accessor, Component, createEffect, For, JSX } from "solid-js";
import { animationValues as av } from "../definitions";

import css from "./window.module.less";


type ContentStackProps = {
    index: Accessor<number>
    children: JSX.Element[],
}

export const ContentStack: Component<ContentStackProps> = (props) => {
    let containerRef: Element | undefined = undefined;
    const childRefs: HTMLDivElement[] = [];

    let prevClientReactsheight = 0;

    createEffect(() => {
        // Get active element
        const e = childRefs[props.index()];
        const currentE = childRefs[0];

        // Get active element's dimensions
        const eClientReacts = e.getClientRects()[0];
        const currentEClientReacts = currentE.getClientRects()[0];

        if (eClientReacts && currentEClientReacts) {

            if (containerRef) {

                // Animate scroll
                animate(
                    containerRef.scrollLeft,
                    eClientReacts.width * props.index(),
                    { ...av.defaultAnimationType, onUpdate: v => containerRef.scrollLeft = v}
                )

                if (prevClientReactsheight === 0) {
                    prevClientReactsheight = currentEClientReacts.height;
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
        }
    })

    return (
        <>
            <div class={css["window-content"]} ref={containerRef}>
                <For each={props.children}>{(child, i) =>
                    <div
                        class={css["content"]}
                        ref={(e) => childRefs[i()] = e}
                    >
                        {child}
                    </div>
                }</For>
            </div>
        </>
    )
}
