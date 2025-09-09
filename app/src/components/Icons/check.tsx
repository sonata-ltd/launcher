import { Ref } from "solid-js"

type DoneIconProps = {
    class?: string,
    ref?: SVGSVGElement,
}

export const CheckIcon = (props: DoneIconProps) => {
    return (
        <svg
            class={props.class}
            ref={props.ref}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.5 12L10.5 15L16.5 9"
                stroke="black"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}
