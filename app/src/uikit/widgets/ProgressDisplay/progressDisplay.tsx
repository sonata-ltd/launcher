import { DoneIcon } from "components/Icons/check-circle";
import css from "./progressDisplay.module.less";
import { ProgressBar } from "uikit/components/Progress";
import clsx from "clsx";
import { Accessor, createEffect, createMemo, createSignal, createUniqueId, For, Match, mergeProps, onMount, Show, Switch } from "solid-js";
import { useWebSockets } from "lib/wsManagment";
import { validateMessageType } from "lib/wsManagment";
import { useWebSocket, WebSocketState } from "lib/wsManagment/wsManager";
import { OK, z } from "zod";
import { wsMessageSchema } from "lib/wsManagment/bindings/WsMessage";
import { operationEventSchema, operationFinishSchema, operationStartSchema, operationUpdateSchema, processStatusSchema, stageStatusSchema } from "lib/wsManagment/bindings";
import { createMutable, createStore } from "solid-js/store";
import { debugComputation } from "@solid-devtools/logger";
import { animate } from "motion";
import { animationValues as av } from "uikit/components/definitions";
import { useLocalization } from "lib/localization/provider";


type ProgressDisplayProps = {
    wsMsgs: Accessor<any[]>,
    getMessagesTracked: () => any[] | null,
    getWSState: () => WebSocketState
}

type StageObject = {
    name: string,
    status: z.infer<typeof processStatusSchema> | undefined,
    progressType: z.infer<typeof operationUpdateSchema>["type"] | undefined,
    current: number,
    total: number,
    time: string
}

type StagesStore = {
    list: StageObject[]
}

export const ProgressDisplay = (props: ProgressDisplayProps) => {
    const lang = useLocalization;

    const requestId = createUniqueId();
    const stages = createMutable<StagesStore>({
        list: [],
    })
    const [isError, setError] = createSignal(false);
    let operationDone: boolean = false;

    let wrapperRef: HTMLDivElement | undefined;

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
                processOperationUpdateMessage(msg.update);
                break;
            case "finish" in msg:
                processOpeartionFinishMessage(msg.finish);
                break;
        }
    }

    const processOpeartionFinishMessage = (msg: z.infer<typeof operationFinishSchema>) => {
        operationDone = true;
    }

    const processOperationUpdateMessage = (msg: z.infer<typeof operationUpdateSchema>) => {
        const i = stages.list.findIndex(e => e.name === msg.details.stage);

        if (i >= 0) {
            stages.list[i].status = msg.details.status;


            if (msg.type !== "Completed") {
                switch (msg.type) {
                    case "Determinable":
                        stages.list[i].current = msg.details.current;
                        stages.list[i].progressType = msg.type;
                        stages.list[i].total = msg.details.total;
                        break;
                }
            }
        }
    }

    const processOperationStartMessage = (msg: z.infer<typeof operationStartSchema>) => {
        if (msg.stages) {
            stages.list.length = 0;

            msg.stages.forEach((e, i) => {
                const stageObject: StageObject = {
                    name: e,
                    status: undefined,
                    progressType: undefined,
                    current: 0,
                    total: 0,
                    time: "0"
                }

                // setStages((prev) => [...prev, stageObject]);
                stages.list.push(stageObject);
            })

            if (!wrapperRef) return;

            setTimeout(() => {
                const childs = wrapperRef.childNodes;

                for (const child of childs) {
                    if (child instanceof HTMLElement) {
                        animate(
                            child,
                            { marginTop: ["100px", 0] },
                            av.elementsPoints.progressStages.animationType
                        )
                    }
                }
            })
        }
    }

    createEffect(() => {
        if (operationDone) return;

        if (props.getWSState() === "CLOSED" ||
            props.getWSState() === "ERROR") {
            setError(true);
        } else if (props.getWSState() === "OPEN") {
            setError(false);
        }
    })

    createEffect(() => {
        props.getMessagesTracked()?.forEach((rawMsg) => {
            handleWSMessage(rawMsg);
        })
    })

    return (
        <>
            <div ref={wrapperRef} class={css["wrapper"]}>
                <For each={stages.list}>
                    {(stage) =>
                        <ProgressItem
                            stage={stage}
                            isError={isError}
                        />
                    }
                </For>
            </div>
        </>
    )
}


type ProgressItemProps = {
    stage: StageObject,
    isError: Accessor<boolean>
}

const ProgressItem = (props: ProgressItemProps) => {
    const stage = createMemo(() => props.stage);

    const [elapsed, setElapsed] = createSignal(0);
    let clearTimer: () => void;

    let isProgressShown: boolean = false;

    let itemRef: HTMLDivElement | undefined;
    let stageNameRef: HTMLParagraphElement | undefined;
    let doneIconRef: SVGSVGElement | undefined;
    let progressContainerRef: HTMLDivElement | undefined;
    let progressBarRef: HTMLProgressElement | undefined;

    const showProgress = () => {
        if (!progressContainerRef
            || !progressBarRef
            || !itemRef
            || !stageNameRef) return;

        animate(
            stageNameRef,
            {
                fontSize: ["16px", "18px"],
                lineHeight: ["24px", "28px"]
            },
            av.defaultAnimationType
        )

        animate(
            [itemRef],
            { margin: [0, "10px 0"] },
            av.defaultAnimationType
        )

        animate(
            [progressContainerRef],
            { height: [0, "12px"] },
            av.defaultAnimationType
        )

        animate(
            [progressBarRef],
            { opacity: [0, 1] },
            av.defaultAnimationType
        )

        isProgressShown = true;
    }

    const hideProgress = () => {
        if (!progressContainerRef
            || !progressBarRef
            || !itemRef
            || !stageNameRef) return;

        animate(
            stageNameRef,
            {
                fontSize: ["18px", "16px"],
                lineHeight: ["28px", "24px"]
            },
            av.defaultAnimationType
        )

        animate(
            [itemRef],
            { margin: ["10px 0", 0] },
            av.defaultAnimationType
        )

        animate(
            [progressContainerRef],
            { height: ["12px", 0] },
            av.defaultAnimationType
        )

        animate(
            [progressBarRef],
            { opacity: [1, 0] },
            av.defaultAnimationType
        )
    }

    createEffect(() => {
        if (stage().status === "completed") {
            if (!doneIconRef) return;

            if (clearTimer) clearTimer();

            animate(
                doneIconRef,
                { width: [0, "max-content"] },
                av.elementsPoints.progressDisplayDoneIcon.animationType
            )
            setTimeout(() => {
                animate(
                    doneIconRef,
                    { opacity: [0, 1], scale: [2, 1] },
                    av.elementsPoints.progressDisplayDoneIcon.animationType
                )
            }, av.elementsPoints.progressDisplayDoneIcon.animationType.duration / 3.5 * 1000);


            if (!stageNameRef) return;
            animate(
                stageNameRef,
                {
                    fontVariationSettings: [`"opsz" 14, "wght" 400"`, `"opsz" 14, "wght" 500`]
                },
                av.defaultAnimationType
            )

            if (isProgressShown) {
                hideProgress();
            }
        } else if (stage().status === "started") {
            const startTime = Date.now();

            const intervalId = setInterval(() => {
                const seconds = (Date.now() - startTime) / 1000;
                setElapsed(seconds)
            }, 100);

            clearTimer = () => {
                clearInterval(intervalId);
            }

        } else if (stage().status === "in_progress") {
            switch (stage().progressType) {
                case "Determinable":
                    showProgress();
                    break;
            }
        }
    })

    createEffect(() => {
        if (props.isError()) {
            if (isProgressShown) {
                hideProgress();
            }

            if (clearTimer) {
                clearTimer();
            }
        }
    })

    return (
        <div
            ref={itemRef}
            class={css["item"]}
            classList={{
                [css["pending"]]: stage().status === undefined,
                [css["inprogress"]]: stage().status === "in_progress"
            }}
        >
            <div class={css["details"]}>
                <DoneIcon
                    ref={doneIconRef}
                    class={clsx(css["icon"])}
                />
                <p
                    ref={stageNameRef}
                    class={css["name"]}
                >
                    {stage().name}
                </p>
                <p
                    class={css["time"]}
                >
                    <Switch fallback={<>Done in {elapsed().toFixed(1)}s</>}>
                        <Match when={stage().status === undefined}>Pending</Match>
                        <Match when={stage().status === "started"}>{elapsed().toFixed(1)}s</Match>
                        <Match when={stage().status === "in_progress"}>{elapsed().toFixed(1)}s</Match>
                        <Match when={props.isError()}>Error</Match>
                    </Switch>
                </p>
            </div>
            <div class={css["progress"]} ref={progressContainerRef}>
                <progress
                    ref={progressBarRef}
                    value={stage().current}
                    max={stage().total}
                ></progress>
            </div>
        </div>
    )
}
