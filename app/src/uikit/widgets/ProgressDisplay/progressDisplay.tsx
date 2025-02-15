import { DoneIcon } from "components/Icons/check-circle";
import css from "./progressDisplay.module.less";
import { ProgressBar } from "uikit/components/Progress";
import clsx from "clsx";
import { Accessor, createEffect, onMount } from "solid-js";
import { useWebSockets } from "lib/wsManagment";
import { validateMessageType } from "lib/wsManagment";
import { useWebSocket } from "lib/wsManagment/wsManager";


type ProgressDisplayProps = {
    wsMsgs: Accessor<any[]>
}

export const ProgressDisplay = (props: ProgressDisplayProps) => {
    // const ws = useWebSocket("debugWS");

    // const { sendMessage } = ws;

    const handleWSMessage  = (rawMsg: any) => {
        console.log(rawMsg);
        const msg = validateMessageType(rawMsg);

        if (!msg) return;

    }

    createEffect(() => {
        const lastMessage = props.wsMsgs()[props.wsMsgs().length - 1];
        handleWSMessage(lastMessage);
    })

    return (
        <>
            <div class={css["wrapper"]}>
                <div class={css["item"]}>
                    <div class={css["details"]}>
                        <DoneIcon />
                        <p>Versions Fetched</p>
                        <p class={css["time"]}>Done in 2s</p>
                    </div>
                </div>
                <div class={`${css["item"]} ${css["inprogress"]}`}>
                    <div class={css["details"]}>
                        <p class={css["inprogress-name"]}>Downloading Libraries...</p>
                        <p class={css["time"]}>17.5s</p>
                    </div>
                    <ProgressBar />
                </div>
                <div class={clsx(css["item"], css["pending"])}>
                    <div class={css["details"]}>
                        <p>Download Assets</p>
                        <p class={css["time"]}>Pending</p>
                    </div>
                </div>
                <div class={clsx(css["item"], css["pending"])}>
                    <div class={css["details"]}>
                        <p>Authenticate Account</p>
                        <p class={css["time"]}>Pending</p>
                    </div>
                </div>
            </div>
        </>
    )
}
