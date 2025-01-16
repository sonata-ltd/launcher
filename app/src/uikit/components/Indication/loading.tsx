import { SpinnerIcon } from "components/Icons/spinner"

import css from "./loading.module.less";
import { Accessor } from "solid-js";
import { DoneIcon } from "components/Icons/check-circle";


type ContentLoadingIndicatorProps = {
    processName?: string,
    spinnerSize?: number,
    ref?: (el: HTMLDivElement | null) => void,
    done?: boolean
}

export const ContentLoadingIndicator = (props: ContentLoadingIndicatorProps) => {
    return (
        <>
            <div
                class={css["indicator-wrapper"]}
                ref={props.ref}
            >
                <div
                    style={
                        `${props.spinnerSize
                            ? `height: ${props.spinnerSize}px; width: ${props.spinnerSize}px`
                            : ""
                        }`
                    }
                >
                    {props.done
                        ? <DoneIcon class={css["done"]} />
                        : <SpinnerIcon class={css["loading"]} />
                    }
                </div>
                <p>{ props.processName }</p>
            </div>
        </>
    )
}
