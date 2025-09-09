import clsx from "clsx";
import { DoneIcon } from "components/Icons/check-circle";
import { handleWSStateChange } from "lib/hooks/progressEvents/parse";
import { createProgressState, processMessages, StageObject } from "lib/hooks/progressEvents/useProgressEvents";
import { useTranslatedMessages } from "lib/localization/useMessages";
import { WebSocketState } from "lib/wsManagment/wsManager";
import { Accessor, createEffect, createMemo, createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { animateCompletedStage, animateNewStages, hideProgress, Names, showProgress, switchNames } from "./animations";
import css from "./progressDisplay.module.less";


type ProgressDisplayProps = {
    wsMsgs: Accessor<any[]>,
    getMessagesTracked: () => any[] | null,
    getWSState: () => WebSocketState
}

export const ProgressDisplay = (props: ProgressDisplayProps) => {
    const progressState = createProgressState();
    const [isError, setError] = createSignal(false);
    let wrapperRef: HTMLDivElement | undefined;

    createEffect(() => {
        if (progressState.operationDone) return;

        handleWSStateChange(props.getWSState(), progressState);
        setError(progressState.isError);
    })

    createEffect(() => {
        processMessages(props.getMessagesTracked(), progressState);
    })

    createEffect(() => {
        if (progressState.stages.list.length > 0) {
            animateNewStages(wrapperRef);
        }
    })

    return (
        <>
            <div ref={wrapperRef} class={css["wrapper"]}>
                <For each={progressState.stages.list}>
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


    const [showProcessedItemsCount, setShowProcessedItemsCount] = createSignal(false);

    let isProgressShown: boolean = false;
    let isNamesSwitched: boolean = false;
    let currentShownName: Names = Names.First;

    let itemRef: HTMLDivElement | undefined;
    let stageNameRef: HTMLParagraphElement | undefined;
    let stageSecondNameRef: HTMLParagraphElement | undefined;
    let stageThirdNameRef: HTMLParagraphElement | undefined;
    let doneIconRef: SVGSVGElement | undefined;
    let progressContainerRef: HTMLDivElement | undefined;
    let progressBarRef: HTMLProgressElement | undefined;
    let pendingMessageRef: HTMLParagraphElement | undefined;
    let runningMessageRef: HTMLParagraphElement | undefined;
    let errorMessageRef: HTMLParagraphElement | undefined;


    const handleSwitchNames = (showName: Names) => {
        return switchNames(showName, stageNameRef, stageSecondNameRef, stageThirdNameRef);
    };

    const handleShowProgress = () => {
        isProgressShown = showProgress(stageNameRef, itemRef, progressContainerRef, progressBarRef);
        if (isProgressShown) {
            isNamesSwitched = true;
            currentShownName = handleSwitchNames(Names.Second);
        }
    };

    const handleHideProgress = () => {
        isProgressShown = hideProgress(stageNameRef, itemRef, progressContainerRef, progressBarRef);
        if (isProgressShown && isNamesSwitched) {
            isNamesSwitched = false;
            currentShownName = handleSwitchNames(Names.First);
        }
    };

    const handleShowProgressDetails = () => {
        isProgressShown = showProgress(stageNameRef, itemRef, progressContainerRef, progressBarRef);
        setShowProcessedItemsCount(true);

        if (!isProgressShown && isNamesSwitched) {
            isNamesSwitched = true;
            currentShownName = handleSwitchNames(Names.Third);
        }
    };



    createEffect(() => {
        if (stage().status === "completed") {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animateCompletedStage(doneIconRef, stageNameRef);

            if (isProgressShown) {
                handleHideProgress();
            }

        } else if (stage().status === "started") {
            startTime = Date.now();
            updateElapsed();

        } else if (stage().status === "in_progress") {
            switch (stage().progressType) {
                case "Determinable":
                    handleShowProgress();
                    break;
            }
        }
    })

    createEffect(() => {
        if (stage().status === "error") {
            if (isProgressShown) {
                handleHideProgress();
            }

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
    })

    createEffect(() => {
        if (elapsed() <= 0) {
            errorMessage = () => "Error";
        } else {
            errorMessage = () => `Error after ${elapsed().toFixed(1)}s`;
        }

        if (elapsed() > 5000) {
            handleShowProgressDetails();
        }
    })


    let errorMessage: () => undefined | string = () => undefined;
    const { get } = useTranslatedMessages();

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
                    <Show
                        when={showProcessedItemsCount}
                    >
                        <p
                            ref={stageThirdNameRef}
                            class={css["third-name"]}
                        >
                            {get(`in_progress__download`)} · {stage().current}/{stage().total}
                        </p>
                    </Show>
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
