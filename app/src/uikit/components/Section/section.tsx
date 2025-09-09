import { JSXElement } from "solid-js";
import css from "./section.module.less";

interface SectionProps {
    label: string,
    children: JSXElement | JSXElement[],
    gapContent?: boolean
}

export const OptionsSection = (props: SectionProps) => {
    return (
        <>
            <div class={css["page"]}>
                <p>{props.label}</p>
                <div
                    style={props.gapContent ? `display: flex; flex-direction: column; gap: 5px` : ``}
                >
                    {props.children}
                </div>
            </div>
        </>
    )
}


interface TextProps {
    children: JSXElement
}

export const DescriptionText = (props: TextProps) => {
    return (
        <>
            <p class={css["description"]}>
                {props.children}
            </p>
        </>
    )
}
