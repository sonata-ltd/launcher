import css from "./bar.module.less";



interface ProgressBarProps {
    class?: string
    ref?: HTMLDivElement
}

export const ProgressBar = (props: ProgressBarProps) => {
    return (
        <>
            <div
                ref={props.ref}
                class={`${props.class} ${css["container"]}`}
            >
                <div class={css["progress-bar"]}>
                    <div class={css["progress-bar-indeterminable"]}></div>
                    <div class={css["progress-bar-indeterminable"]}></div>
                    <div class={css["progress-bar-indeterminable"]}></div>
                </div>
            </div>
        </>
    )
}
