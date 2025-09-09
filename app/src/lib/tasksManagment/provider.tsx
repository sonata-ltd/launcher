import { createContext, createSignal, ParentProps, useContext } from "solid-js";


/**
 * @interface Task
 * @prop {string} name - Name of the task.
 * @prop {string?} descr - Description of the task.
 * @prop {boolean?} isActive - Whether this task is currently active (processing or doing something).
 * @prop {number?} progressPercentage - Progress in percentage (0–100). Use this if progress tracking is relevant (e.g., a download task).
 * @prop {boolean?} isDone - Whether this task is completed and does nothing else.
 * @prop {boolean?} isErrored - Whether this task encountered an error while running.
 */
export interface Task {
    name: string,
    descr?: string,
    isActive?: boolean,
    progressPercentage?: boolean,
    isDone?: boolean,
    isErrored?: boolean,
}


const TasksContext = createContext();

export function TasksProvider(props: ParentProps) {
    const [tasks, setTasks] = createSignal<Task[]>([]);

    return (
        <TasksContext.Provider value={tasks}>
            {props.children}
        </TasksContext.Provider>
    )
}

export function useTasks() {
    const context = useContext(TasksContext);

    if (!context) {
        throw new Error("useTasks must be used inside TasksProvider");
    }

    return context;
}
