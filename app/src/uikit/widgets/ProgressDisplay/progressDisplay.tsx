import clsx from "clsx";
import { DoneIcon } from "components/Icons/check-circle";
import { useMessages } from "lib/localization/useMessages";
import { validateMessageType } from "lib/wsManagment";
import { operationEventSchema, operationFinishSchema, operationStageSchema, operationStartSchema, operationUpdateSchema, processStatusSchema } from "lib/wsManagment/bindings";
import { WebSocketState } from "lib/wsManagment/wsManager";
import { animate } from "motion";
import { Accessor, createEffect, createMemo, createSignal, createUniqueId, For, Match, onCleanup, Switch } from "solid-js";
import { createMutable } from "solid-js/store";
import { animationValues as av } from "uikit/components/definitions";
import { z } from "zod";
import css from "./progressDisplay.module.less";


type ProgressDisplayProps = {
    wsMsgs: Accessor<any[]>,
    getMessagesTracked: () => any[] | null,
    getWSState: () => WebSocketState
}

type StageObject = {
    name: z.infer<typeof operationStageSchema>,
    status: z.infer<typeof processStatusSchema> | undefined | "error",
    progressType: z.infer<typeof operationUpdateSchema>["type"] | undefined,
    current: number,
    total: number,
    time: string
}

type StagesStore = {
    list: StageObject[]
}

export const ProgressDisplay = (props: ProgressDisplayProps) => {
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
                            { marginTop: ["100px", 0], opacity: [0, 1] },
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
            stages.list.forEach((e) => {
                if (e.status === "in_progress" ||
                    e.status === "started" ||
                    e.status === undefined) {
                    e.status = "error";
                }
            })
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
    let startTime = Date.now();
    let animationFrameId: number;

    const updateElapsed = () => {
        const now = Date.now();
        setElapsed((now - startTime) / 1000);
        animationFrameId = requestAnimationFrame(updateElapsed);
    };

    onCleanup(() => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    });


    let isProgressShown: boolean = false;
    let isNamesSwitched: boolean = false;

    let itemRef: HTMLDivElement | undefined;
    let stageNameRef: HTMLParagraphElement | undefined;
    let stageSecondNameRef: HTMLParagraphElement | undefined;
    let doneIconRef: SVGSVGElement | undefined;
    let progressContainerRef: HTMLDivElement | undefined;
    let progressBarRef: HTMLProgressElement | undefined;
    let pendingMessageRef: HTMLParagraphElement | undefined;
    let runningMessageRef: HTMLParagraphElement | undefined;
    let errorMessageRef: HTMLParagraphElement | undefined;

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

        switchNames(false);
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

        isProgressShown = false;

        if (isNamesSwitched) switchNames(true);
    }

    createEffect(() => {
        if (stage().status === "completed") {
            if (!doneIconRef) return;

            // if (clearTimer) clearTimer();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animate(
                doneIconRef,
                { width: [0, "20px"] },
                av.elementsPoints.progressDisplayDoneIcon.animationType
            )
            setTimeout(() => {
                animate(
                    doneIconRef,
                    { opacity: [0, 1], scale: [2, 1], marginInlineEnd: [0, "7px"] },
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
            startTime = Date.now();
            updateElapsed();

        } else if (stage().status === "in_progress") {
            switch (stage().progressType) {
                case "Determinable":
                    showProgress();
                    break;
            }
        }
    })

    const { get } = useMessages();

    const switchNames = (showPrimary: boolean) => {
        if (!stageNameRef ||
            !stageSecondNameRef) return;

        if (showPrimary === false) {
            animate(
                stageNameRef,
                { opacity: [1, 0] },
                av.elementsPoints.progressNames.animationType
            )

            animate(
                stageSecondNameRef,
                { opacity: [0, 1] },
                av.elementsPoints.progressNames.animationType
            )

            isNamesSwitched = true;
        } else {
            animate(
                stageNameRef,
                { opacity: [0, 1] },
                av.elementsPoints.progressNames.animationType
            )

            animate(
                stageSecondNameRef,
                { opacity: [1, 0] },
                av.elementsPoints.progressNames.animationType
            )

            isNamesSwitched = false;
        }
    }

    let errorMessage: () => undefined | string = () => undefined;

    createEffect(() => {
        if (elapsed() <= 0) {
            errorMessage = () => "Error";
        } else {
            errorMessage = () => `Error after ${elapsed().toFixed(1)}s`;
        }

        if (stage().status === "error") {
            if (isProgressShown) {
                hideProgress();
            }

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
                <div class={css["name-container"]}>
                    <p
                        ref={stageNameRef}
                        class={css["name"]}
                    >
                        {get(stage().name)}
                    </p>
                    <p
                        ref={stageSecondNameRef}
                        class={css["second-name"]}
                    >
                        {get(`in_progress__${stage().name}`)}
                    </p>
                </div>
                {/* <div class={css["time-container"]}>
                    <p ref={pendingMessageRef} class={css["pending"]}>Pending</p>
                    <p ref={runningMessageRef} class={css["running"]}>{elapsed().toFixed(1)}s</p>
                    <p ref={errorMessageRef} class={css["error"]}>{errorMessage}</p>
                </div> */}
                <p
                    class={css["time"]}
                >
                    <Switch fallback={<>Done in {elapsed().toFixed(1)}s</>}>
                        <Match when={stage().status === undefined}>Pending</Match>
                        <Match when={stage().status === "started"}>{elapsed().toFixed(1)}s</Match>
                        <Match when={stage().status === "in_progress"}>{elapsed().toFixed(1)}s</Match>
                        <Match when={stage().status === "error"}>{errorMessage()}</Match>
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
