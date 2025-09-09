import { createEffect, createMemo, createSignal, Show } from "solid-js";
import css from "./tasklist.module.less";
import { useWebSocket } from "lib/wsManagment/manager";
import { Tasklist } from "./tasklist";
import { createStore } from "solid-js/store";
import { z } from "zod";
import { taskSchema } from "lib/wsManagment/bindings/Task";

type TasksProps = {
    totalTasks?: number;
    completedTasks?: number;
    size?: number;
    strokeWidth?: number;
    rounded?: boolean;
};

export type Task = z.infer<typeof taskSchema>;

export interface TaskEntry {
    self: Task,
    isActive: boolean
}

export function Tasks(props: TasksProps) {
    const ws = useWebSocket("debugTasks");
    const { sendMessage, messages, state, getMessagesTracked } = ws;

    const [tasklistOpen, setTasklistOpen] = createSignal<boolean>(true);
    const [registeredTasks, setRegisteredTasks] = createStore<TaskEntry[]>([]);

    const activeTaskCount = createMemo(() => {
        return registeredTasks.filter(task => task.isActive).length;
    })

    const size = props.size ?? 70;
    const strokeWidth = props.strokeWidth ?? 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = createMemo(() => {
        const total = registeredTasks.length;

        if (registeredTasks.length === 0) return 0;

        const completed = total - activeTaskCount();
        return (completed / total) * circumference;
    });


    return (
        <>
            <div
                class={css["container"]}
                style={`
                height: ${size}px;
                width: ${size}px
            `}
            >
                <div class={css["bg"]}></div>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Серый фон */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#d1d5db"
                        stroke-width={strokeWidth}
                        fill="none"
                    />
                    {/* Прогресс бар */}
                    {registeredTasks.length > 0 && (
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#3b82f6"
                            stroke-width={strokeWidth}
                            fill="none"
                            stroke-dasharray={circumference.toString()}
                            stroke-dashoffset={(circumference - progress()).toString()}
                            stroke-linecap={props.rounded ? "round" : "butt"}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    )}
                    {/* <text
                    x="50%"
                    y="50%"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    font-size={(size / 3).toString()}
                    font-weight="bold"
                    fill="#222"
                >
                    {props.totalTasks === 0 ? "0" : props.completedTasks === props.totalTasks ? "✔" : props.completedTasks}
                </text> */}
                </svg>
                <button
                    class={css["details"]}
                    onClick={() => setTasklistOpen(!tasklistOpen())}
                >
                    <p>
                        {/* {props.totalTasks === 0 ? "0" : props.completedTasks === props.totalTasks ? "✔" : props.completedTasks} */}
                        {activeTaskCount()}
                    </p>
                </button>
            </div>
            <Tasklist
                isOpen={tasklistOpen}
                wsMessagesTracked={getMessagesTracked}
                registeredTasks={registeredTasks}
                setRegisteredTasks={setRegisteredTasks}
            />
        </>
    );
}
