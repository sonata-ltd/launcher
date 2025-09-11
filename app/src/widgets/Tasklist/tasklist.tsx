import { ProgressBar } from "uikit/components/Progress";
import css from "./tasklist.module.less";
import { Spinner } from "uikit/components/Spinner/spinner";
import { Accessor, createEffect, createMemo, createSignal, For, on, onMount, Show } from "solid-js";
import { createOverlayScrollbars } from "overlayscrollbars-solid";
import 'overlayscrollbars/overlayscrollbars.css';
import { SetStoreFunction } from "solid-js/store";
import { taskSchema } from "lib/msgBindings";
import { validateMessageTypeCustom } from "lib/wsManagment/parser";
import { useTranslatedMessages } from "lib/localization/useMessages";
import { Task, TaskEntry } from "./tasks";
import { animate } from "motion";
import { debugOwnerComputations } from "@solid-devtools/logger";
import { createSign } from "node:crypto";
import { availableLanguageTags } from "lib/localization/paraglide/runtime";
import { animationValues as av } from "uikit/components/definitions";


interface TasklinkProps {
    isOpen: Accessor<boolean>,
    wsMessagesTracked: () => any[] | null,
    registeredTasks: TaskEntry[],
    setRegisteredTasks: SetStoreFunction<TaskEntry[]>
}

export const Tasklist = (props: TasklinkProps) => {
    const { registeredTasks, setRegisteredTasks } = props;
    let tasklistContainerRef: HTMLDivElement | undefined;
    // const tasks = [<Task />, <Task />, <Task />, <Task />, <Task />, <Task />, <Task />];

    createEffect(() => {
        props.wsMessagesTracked()?.forEach((msg) => {
            const validatedTask = validateMessageTypeCustom(taskSchema, msg.task);

            if (validatedTask) {
                const isActive = () => validatedTask.data.status === "Pending"
                    || validatedTask.data.status === "Running";

                const exists = registeredTasks.some(t => t.self.id === validatedTask.id);
                if (!exists) {
                    setRegisteredTasks(tasks => [...tasks, {
                        self: validatedTask,
                        isActive: isActive()
                    }]);
                } else {
                    const idx = registeredTasks.findIndex(t => t.self.id === validatedTask.id);
                    setRegisteredTasks(idx, {
                        self: validatedTask,
                        isActive: isActive()
                    });
                }
            }
        })
    });

    const setTaskActive = (id: number, isActive: boolean) => {
        const idx = registeredTasks.findIndex(t => t.self.id === id);

        if (idx !== -1) {
            setRegisteredTasks(idx, "isActive", isActive);
        }
    }

    const removeTask = (id: number) => {
        setRegisteredTasks((prev) => prev.filter(t => t.self.id !== id));
    }

    const [initTasklistScrollbars, getTasklistScrollbarsInstance] = createOverlayScrollbars({
        defer: false,
        options: {
            scrollbars: {
                autoHide: 'scroll',
                clickScroll: true
            },
            overflow: {
                x: 'hidden',
            },
        },
    });

    onMount(() => {
        if (tasklistContainerRef) {
            initTasklistScrollbars(tasklistContainerRef);
        }

        return () => getTasklistScrollbarsInstance()?.destroy();
    });

    return (
        <>
            <div
                ref={tasklistContainerRef}
                class={css["tasklist-container"]}
                classList={{
                    [css.hidden]: !props.isOpen()
                }}
            >
                <div class={css["tasklist-wrapper"]}>
                    <Show
                        when={registeredTasks.length}
                        fallback={
                            <>
                                <div class={css["no-tasks-container"]}>
                                    <p>No active tasks</p>
                                </div>
                            </>
                        }
                    >
                        <For each={registeredTasks}>
                            {(taskEntry) =>
                                <>
                                    <div class={css["divider"]}></div>
                                    <TaskCard task={taskEntry.self} setTaskActive={setTaskActive} removeTask={removeTask} />
                                </>
                            }
                        </For>
                    </Show>
                </div>
            </div>
        </>
    )
}


interface TaskProps {
    task: Task,
    setTaskActive: (id: number, isActive: boolean) => void,
    removeTask: (id: number) => void
}

const TaskCard = (props: TaskProps) => {
    const DEFAULT_DISMISS_SHOW_DELAY = 3000; // ms
    const DEFAULT_DISMISS_DELAY = 5; // s

    const { get } = useTranslatedMessages();
    const taskId = props.task.id;
    const [completed, setCompleted] = createSignal(false);
    const [intermediate, setIntermediate] = createSignal(true);
    const [showDismiss, setShowDismiss] = createSignal(false);
    const [spinValue, setSpinValue] = createSignal(0);
    const [isMouseOverTask, setMouseOverTask] = createSignal(false);
    const [dismissAnim, setDismissAnim] = createSignal<any | null>(null);

    let progressBar: HTMLDivElement | undefined;

    createEffect(() => {
        const status = props.task.data.status;

        if (status === "Running" || status === "Pending") {
            props.setTaskActive(taskId, true);
        } else {
            props.setTaskActive(taskId, false);
        }

        if (status === "Completed") {
            setCompleted(true);
            setIntermediate(false);

            setTimeout(() => {
                setCompleted(false);
                setShowDismiss(true);
            }, DEFAULT_DISMISS_SHOW_DELAY);
        }
    })

    createEffect(() => {
        if (completed() === true && progressBar) {
            animate(
                progressBar,
                {
                    marginTop: ["0", "-20px"],
                    opacity: [1, 0]
                },
                av.defaultAnimationType
            )
        }
    })

    createEffect(
        on(
            () => showDismiss(),
            (show) => {
                if (!show) return;

                setDismissAnim(animate(spinValue(), 100, {
                    duration: DEFAULT_DISMISS_DELAY,
                    ease: "linear",
                    onUpdate(latest) {
                        setSpinValue(latest);
                    },
                    onComplete() {
                        props.removeTask(taskId);
                    }
                }));
            }
        )
    );

    createEffect(() => {
        if (!dismissAnim()) {
            console.warn("not found");
        } else {
            if (isMouseOverTask()) {
                dismissAnim().pause();
            } else {
                dismissAnim().play();
            }
        }
    });

    const getRemainingSeconds = (totalDelaySec: number, currentValue: number) => {
        const elapsed = (currentValue / 100) * totalDelaySec;
        const remaining = totalDelaySec - elapsed;
        return Math.ceil(Math.max(0, remaining));
    }

    const statusText = createMemo(() => {
        if (completed()) {
            return "Completed";
        }

        const stage = props.task.data.stage;
        if (stage != null) {
            return get(stage);
        }

        return "Pending data delivery";
    });

    return (
        <>
            <div
                class={css["task"]}
                onMouseEnter={() => setMouseOverTask(true)}
                onMouseLeave={() => setMouseOverTask(false)}
            >
                <p class={css["name"]}>
                    {
                        props.task.data.name != null
                            ? props.task.data.name
                            : "Awaiting task initialization"
                    }
                </p>
                <ProgressBar class={css["progressbar"]} ref={progressBar} />
                <div class={css["details-container"]}>
                    <Spinner
                        class={css["spinner"]}
                        size={16}
                        spinnerColor="#474b51"
                        forceIndeterminate={intermediate()}
                        completed={completed()}
                        value={spinValue()}
                        maxValue={100}
                        reverseValue
                    />
                    <Show
                        when={!showDismiss()}
                        fallback={
                            <>
                                <p class={css["details"]}>
                                    Dismiss in {getRemainingSeconds(DEFAULT_DISMISS_DELAY, spinValue())}s
                                </p>
                            </>
                        }
                    >
                        <p class={css["details"]}>
                            {statusText()}
                        </p>
                    </Show>
                </div>
            </div>
        </>
    )
}
