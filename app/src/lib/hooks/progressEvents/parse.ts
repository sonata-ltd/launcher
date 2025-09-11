import { validateMessageType } from "lib/wsManagment";
import { operationEventSchema, operationStartSchema, operationUpdateSchema } from "lib/msgBindings";
import { z } from "zod";
import { ProgressState, StageObject } from "./useProgressEvents";


/**
 * Processes a WebSocket message to update progress state
 * @param rawMsg - Raw message from WebSocket
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function handleWSMessage(rawMsg: any, state: ProgressState): ProgressState {
    if (!rawMsg) return state;

    console.log(rawMsg);
    const msg = validateMessageType(rawMsg);
    if (!msg) return state;


    switch (msg.type) {
        case "operation":
            return processOperationMessage(msg.payload.data, state);
    }

    return state;
}

/**
 * Processes an operation message
 * @param msg - Operation event message
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function processOperationMessage(
    msg: z.infer<typeof operationEventSchema>,
    state: ProgressState
) {
    switch (true) {
        case "start" in msg:
            processOperationStartMessage(msg.start, state);
            break;
        case "update" in msg:
            processOperationUpdateMessage(msg.update, state);
            break;
        case "finish" in msg:
            processOperationFinishMessage(state);
            break;
    }

    return state;
}

/**
 * Processes an operation start message
 * @param msg - Operation start message
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function processOperationStartMessage(
    msg: z.infer<typeof operationStartSchema>,
    state: ProgressState
): ProgressState {
    if (msg.stages) {
        state.stages.list.length = 0;

        msg.stages.forEach((e) => {
            const stageObject: StageObject = {
                name: e,
                status: undefined,
                progressType: undefined,
                current: 0,
                total: 0,
                time: "0"
            }

            // setStages((prev) => [...prev, stageObject]);
            state.stages.list.push(stageObject);
        })
    }

    return state;
}

/**
 * Processes an operation update message
 * @param msg - Operation update message
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function processOperationUpdateMessage(
    msg: z.infer<typeof operationUpdateSchema>,
    state: ProgressState
): ProgressState {
    const i = state.stages.list.findIndex(e => e.name === msg.details.stage);

    if (i >= 0) {
        state.stages.list[i].status = msg.details.status;


        if (msg.type !== "Completed") {
            switch (msg.type) {
                case "Determinable":
                    state.stages.list[i].current = msg.details.current;
                    state.stages.list[i].progressType = msg.type;
                    state.stages.list[i].total = msg.details.total;
                    break;

                // TODO: Implement Indeterminable
            }
        }
    }

    return state;
}

/**
 * Processes an operation finish message
 * @param msg - Operation finish message
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function processOperationFinishMessage(
    state: ProgressState
): ProgressState {
    state.operationDone = true;
    return state;
}

/**
 * Handles WebSocket state changes
 * @param wsState - Current WebSocket state
 * @param state - Current progress state
 * @returns Updated progress state
 */
export function handleWSStateChange(wsState: string, state: ProgressState): ProgressState {
    if (state.operationDone) return state;

    if (wsState === "CLOSED" || wsState === "ERROR") {
        state.stages.list.forEach((e) => {
            if (e.status === "in_progress" ||
                e.status === "started" ||
                e.status === undefined) {
                e.status = "error";
            }
        });
        state.isError = true;
    } else if (wsState === "OPEN") {
        state.isError = false;
    }

    return state;
}
