import { SpinnerIcon } from "components/Icons/spinner"

import css from "./loading.module.less";


type ContentLoadingIndicatorProps = {
    processName?: string,
}

export const ContentLoadingIndicator = (props: ContentLoadingIndicatorProps) => {
    return (
        <>
            <div class={css["indicator-wrapper"]}>
                <div>
                    <SpinnerIcon />
                </div>
                <p>{ props.processName || "Loading..." }</p>
            </div>
        </>
    )
}
