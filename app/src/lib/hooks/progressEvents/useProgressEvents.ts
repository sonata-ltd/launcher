import { operationStageSchema, operationUpdateSchema, processStatusSchema } from "lib/msgBindings"
import { createMutable } from "solid-js/store"
import { z } from "zod"
import { handleWSMessage } from "./parse"


export type StageObject = {
    name: z.infer<typeof operationStageSchema>,
    status: z.infer<typeof processStatusSchema> | undefined | "error",
    progressType: z.infer<typeof operationUpdateSchema>["type"] | undefined,
    current: number,
    total: number,
    time: string
}

export type StagesStore = {
    list: StageObject[]
}

export type ProgressState = {
    stages: StagesStore,
    operationDone: boolean,
    isError: boolean
}


export const createProgressState = (): ProgressState => {
    const state: ProgressState = {
        stages: createMutable<StagesStore>({
            list: []
        }),
        operationDone: false,
        isError: false
    };

    return state;
}

export function processMessages(
    messages: any[] | null,
    state: ProgressState
): ProgressState {
    if (!messages) return state;

    messages.forEach((rawMsg) => {
        handleWSMessage(rawMsg, state);
    })

    return state;
}
