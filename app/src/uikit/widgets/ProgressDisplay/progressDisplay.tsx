import { DoneIcon } from "components/Icons/check-circle";
import css from "./progressDisplay.module.less";
import { ProgressBar } from "uikit/components/Progress";
import clsx from "clsx";
import { Accessor, createEffect, createMemo, createSignal, createUniqueId, For, Match, mergeProps, onMount, Switch } from "solid-js";
import { useWebSockets } from "lib/wsManagment";
import { validateMessageType } from "lib/wsManagment";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { z } from "zod";
import { wsMessageSchema } from "lib/wsManagment/bindings/WsMessage";
import { operationEventSchema, operationStartSchema, processStatusSchema } from "lib/wsManagment/bindings";


type StageObject = {
    name: string,
    status: z.infer<typeof processStatusSchema> | undefined,
    progress: number,
    current: number,
    total: number,
    time: string
}

type ProgressDisplayProps = {
    wsMsgs: Accessor<any[]>,
    getMessagesTracked: () => any[] | null,
}

export const ProgressDisplay = (props: ProgressDisplayProps) => {
    const requestId = createUniqueId();
    const [stages, setStages] = createSignal<StageObject[]>([]);

    const handleWSMessage = (rawMsg: any) => {
        if (!rawMsg) return;

        const msg = validateMessageType(rawMsg);

        if (!msg) return;

        switch (msg.type) {
            case "operation":
                processOperationMessage(msg.payload.data);
        }
    }

    const processOperationMessage = (msg: z.infer<typeof operationEventSchema>) => {
        switch (true) {
            case "start" in msg:
                processOperationStartMessage(msg.start);
                break;
            case "update" in msg:
                console.log("it's update");
                break;
        }
    }

    const processOperationStartMessage = (msg: z.infer<typeof operationStartSchema>) => {
        if (msg.stages) {
            msg.stages.forEach((e, i) => {
                const stageObject: StageObject = {
                    name: e,
                    status: undefined,
                    progress: 0,
                    current: 0,
                    total: 0,
                    time: "0"
                }

                setStages((prev) => [...prev, stageObject]);
            })
        } else {
            console.warn("Stages is not found.");
        }
    }

    createEffect(() => {
        console.log(stages());
    })

    createEffect(() => {
        props.getMessagesTracked()?.forEach((rawMsg) => {
            handleWSMessage(rawMsg);
        })
    })

    return (
        <>
            <div class={css["wrapper"]}>
                <For each={stages()}>
                    {(stage) =>
                        <ProgressItem
                            stage={() => stage}
                        />
                    }
                </For>
                {/* <div class={css["item"]}>
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
                </div> */}
            </div>
        </>
    )
}


type ProgressItemProps = {
    stage: Accessor<StageObject>
}

const ProgressItem = (props: ProgressItemProps) => {
    const stage = createMemo(() => props.stage());

    return (
        <div
            class={css["item"]}
            classList={{ [css["pending"]]: stage().status === undefined }}
        >
            <div class={css["details"]}>
                <Switch fallback={<></>}>
                    <DoneIcon />
                </Switch>
                <p>{stage().name}</p>
                <p
                    class={css["time"]}
                >
                    <Switch fallback={<>Done in 2s</>}>
                        <Match when={stage().status === undefined}>Pending</Match>
                    </Switch>
                </p>
            </div>
        </div>
    )
}
