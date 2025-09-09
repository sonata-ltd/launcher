import { AlertTriangle } from "uikit/icons/components/alert-triangle";
import css from "./reconnect.module.less";
import { Separator } from "uikit/components/Separator/separator";
import { Spinner } from "uikit/components/Spinner/spinner";
import { createEffect, createSignal, onMount } from "solid-js";
import { animate } from "motion";
import { animationValues as av } from "uikit/components/definitions";

export interface ReconnectScreenProps {
    exposeTrigger: (fn: () => Promise<void>) => void,
}

export const ReconnectScreen = (props: ReconnectScreenProps) => {
    const [completed, setCompleted] = createSignal(false);
    let screen: HTMLDivElement | undefined;

    createEffect(() => {
        setCompleted(false);

        if (screen) {
            screen.style.opacity = "0";
            animate(
                screen,
                { opacity: [0, 1]},
                av.defaultAnimationType
            );
        }
    })

    const triggerFinalize = async () => {
        await new Promise(async (res) => {
            setCompleted(true);

            await new Promise((res) => {
                setTimeout(res, 700)
            })

            if (screen) {
                animate(
                    screen,
                    { opacity: [1, 0]},
                    av.defaultAnimationType
                ).then(() => {
                    setTimeout(res, 100);
                })
            } else {
                setTimeout(res, 100);
            }
        })
    }

    onMount(() => {
        props.exposeTrigger?.(() => triggerFinalize());
    })

    return (
        <>
            <div class={css.container} ref={screen}>
                <div class={css.header}>
                    <AlertTriangle />
                    <p>Core Connection Error</p>
                </div>
                <div class={css.details}>
                    <div class={css.descr}>
                        <p>The Launcher was unable to reach the core service.</p>
                        <p>This may indicate that the core process is not running, the communication channel is unavailable, or configuration parameters are invalid.</p>
                    </div>
                    <Separator />
                    <div class={css.add}>
                        <Spinner
                            class={css.spinner}
                            size={20}
                            spinnerColor="#474b51"
                            completed={completed()}
                        />
                        <p>Attempting to reconnect...</p>
                    </div>
                </div>
            </div>
        </>
    )
}
