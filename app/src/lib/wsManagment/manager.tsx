import { createContext, createSignal, onCleanup, ParentProps, useContext } from "solid-js";
import { wsEndpoints } from "./types";
import { createWebSocketClient } from "./client";
import { initRequiredSockets } from "./reqManager";

export type WebSocketState = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";
type MessageHandler = (message: any) => void;

export interface WebSocketClient {
    state: () => WebSocketState,
    messages: any[],
    send: (data: any) => void,
    addListener: (handler: MessageHandler) => void,
    removeListener: (handler: MessageHandler) => void
}

type WebSocketManager = {
    [K in keyof typeof wsEndpoints]: WebSocketClient;
}


const WebSocketContext = createContext<{ manager: WebSocketManager; requiredStates: () => Record<string, WebSocketState>; allRequiredConnected: () => boolean }>();

export const WebSocketProvider = (props: ParentProps) => {
    const manager = {} as WebSocketManager;
    const { requiredStates, allRequiredConnected, openCount, totalRequired } = initRequiredSockets(manager, {
        autoReconnect: true,
        reconnectDelay: 1000
      });

    // const manager = createMemo(() => {
    //     return {} as WebSocketManager;
    // });

    return (
        <WebSocketContext.Provider value={{manager, requiredStates, allRequiredConnected}}>
            {props.children}
        </WebSocketContext.Provider>
    )
}

export const useWebSockets = () => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error("useWebSockets must be used within WebSocketProvider");
    }

    return context;
}

export const useWebSocket = <K extends keyof WebSocketManager>(
    endpoint: K,
    autoReconnect: boolean = false,
    reconnectDelay: number = 1000
) => {
    const manager = useWebSockets().manager;

    if (!manager[endpoint]) {
        const endpointData = wsEndpoints[endpoint];
        if (!endpointData) {
            throw new Error(`Endpoint "${endpoint}" not found in wsEndpoints`);
        }

        manager[endpoint] = createWebSocketClient(endpointData.url, autoReconnect, reconnectDelay);
    }

    const client = manager[endpoint];

    const [messages, setMessages] = createSignal<any[]>(client.messages, { equals: false });
    let trackedGivenMessages = 0;

    /**
    * Tracks all unreturned messages
    * and gives it with memorization
    * @returns {any[] | null} - The messages array or nothing if all messages are already sent.
    */
    const getMessagesTracked = (): any[] | null => {
        const total = messages().length;
        const returnable = messages().slice(trackedGivenMessages, total);
        trackedGivenMessages = total;

        if (returnable.length === 0) {
            return null;
        }

        return returnable;
    }

    const getMessagesOptioned = (options: {
        last?: boolean,
        all?: boolean,
        from?: number,
        to?: number
    }): any[] | Error => {
        const {
            last,
            all,
            from,
            to
        } = options;

        if (last) return messages()[messages().length - 1];
        if (all) return [...messages()];

        if (from !== undefined && to !== undefined) {
            if (from >= 0 && from <= to) {
                return messages().slice(from, to);
            } else {
                throw new Error("Cannot return array from " + from + " to " + to
                    + ". From index should be lower than to and bigger or equals to zero.");
            }
        } else {
            console.log("not found");
        }

        console.log("sending last value");
        return messages()[messages().length - 1];
    }

    const handler: MessageHandler = (msg) => {
        setMessages(prev => [...prev, msg]);
    }

    onCleanup(() => client.removeListener(handler));
    client.addListener(handler);

    return {
        state: client.state,
        messages,
        getMessagesTracked,
        getMessagesOptioned,
        sendMessage: client.send
    }
}
