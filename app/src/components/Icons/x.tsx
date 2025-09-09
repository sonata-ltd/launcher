import { Ref } from "solid-js"

type XIconProps = {
    class?: string,
    ref?: SVGSVGElement,
    style?: string,
    viewBox?: string,
    gTransform?: string
}

export const XIcon = (props: XIconProps) => {
    return (
        <svg
            class={props.class}
            ref={props.ref}
            style={props.style}
            width="24"
            height="24"
            viewBox={props.viewBox || "0 0 24 24"}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g transform={props.gTransform}>
                <path
                    d="M17 7L7 17M7 7L17 17"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>
        </svg>
    )
}
