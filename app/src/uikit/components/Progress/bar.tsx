import css from "./bar.module.less";

export const ProgressBar = () => {
    return (
        <>
            <div
                class={css["container"]}
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
