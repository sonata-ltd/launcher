import { createEffect, createMemo, createSignal } from "solid-js";
import { WebSocketClient, WebSocketState } from "./manager";
import { wsEndpoints } from "./types";
import { createWebSocketClient } from "./client";

type ManagerLike = {
    [K in EndpointKey]?: WebSocketClient;
};
type EndpointKey = keyof typeof wsEndpoints;

export function initRequiredSockets(
    manager: ManagerLike,
    opts: { autoReconnect?: boolean; reconnectDelay?: number } = {}
) {
    const { autoReconnect = true, reconnectDelay = 1000 } = opts;

    // Signal with map of states { endpointName: state }
    const [requiredStates, setRequiredStates] = createSignal<Record<EndpointKey, WebSocketState>>({} as Record<EndpointKey, WebSocketState>);

    const requiredList = (Object.keys(wsEndpoints) as EndpointKey[]).filter(
        (k) => wsEndpoints[k].required
    );

    requiredList.forEach((key) => {
        if (!manager[key]) {
            manager[key] = createWebSocketClient(wsEndpoints[key].url, autoReconnect, reconnectDelay);
        };

        // On every client.state() change update the requiredStates
        createEffect(() => {
            const client = manager[key]!;
            const s = client.state();
            setRequiredStates((prev) => ({ ...prev, [key]: s }));
        })
    })

    const totalRequired = requiredList.length;

    const openCount = createMemo(() =>
        Object.values(requiredStates()).filter((s) => s === "OPEN").length
    )

    const allRequiredConnected = createMemo(() =>
        requiredList.every((key) => requiredStates()[key] === "OPEN")
    )

    return {
        requiredStates,
        openCount,
        totalRequired,
        allRequiredConnected
    }
}
