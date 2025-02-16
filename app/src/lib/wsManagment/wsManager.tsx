import { Accessor, createContext, createEffect, createMemo, createSignal, createUniqueId, onCleanup, ParentProps, useContext } from "solid-js";
import { wsEndpoints } from "./types";
import { createStore } from "solid-js/store";
import { useLogger } from "lib/logger";
import { createSign, randomUUID } from "crypto";
import Page from "pages/Instances/instances";
import { debugComputation, debugOwnerSignals, debugSignals } from "@solid-devtools/logger";

type WebSocketState = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";
type MessageHandler = (message: any) => void;

type WebSocketClient = {
    state: () => WebSocketState,
    messages: any[],
    send: (data: any) => void,
    addListener: (handler: MessageHandler) => void,
    removeListener: (handler: MessageHandler) => void
}

type WebSocketManager = {
    [K in keyof typeof wsEndpoints]: WebSocketClient;
}


const WebSocketContext = createContext<WebSocketManager>();

const createWebSocketClient = (url: string, autoReconnect = true): WebSocketClient => {
    const [{ log }] = useLogger();

    const [state, setState] = createSignal<WebSocketState>("CONNECTING");
    let localState: WebSocketState = state();

    const [messages, setMessages] = createStore<any[]>([]);
    const [queuedMessages, setQueuedMessages] = createSignal<any[]>([]);

    const listeners = new Set<MessageHandler>();

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;


    const addListener = (handler: MessageHandler) => {
        listeners.add(handler);
    }

    const removeListener = (handler: MessageHandler) => {
        listeners.delete(handler);
    }

    const changeState = (state: WebSocketState) => {
        setState(state);
        localState = state;
    }

    const sendMsg = (data: any) => {
        socket?.send(data);
    }

    const connect = () => {
        changeState("CONNECTING");
        if (socket) return;

        socket = new WebSocket(url);

        socket.onopen = () => {
            changeState("OPEN");
            clearTimeout(reconnectTimer);

            if (queuedMessages().length > 0) {

                for (let i = 0; i < queuedMessages().length; i++) {
                    const msg = queuedMessages()[i];
                    sendMsg(msg);

                    setQueuedMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages.splice(i, 1);
                        return newMessages;
                    })
                }
            }
        }

        socket.onclose = (e) => {
            changeState("CLOSED");
            socket = null;

            if (autoReconnect && !e.wasClean) {
                reconnectTimer = setTimeout(connect, 1000);
            }
        }

        socket.onerror = (e) => {
            changeState("ERROR");
            socket?.close();
        }

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prev) => [...prev, data]);
            listeners.forEach(handler => handler(data));
        }
    }

    const send = (data: any) => {
        if (localState === "OPEN") {
            sendMsg(data);
        } else {
            setQueuedMessages((prev) => [...prev, data]);

            if (localState === "CLOSED" || localState === "ERROR") {
                connect();
            }
        }
    }

    const destroy = () => {
        clearTimeout(reconnectTimer);
        socket?.close();
    }

    onCleanup(destroy);
    connect();

    return {
        state,
        get messages() { return [...messages]; },
        send,
        addListener,
        removeListener
    }
}

export const WebSocketProvider = (props: ParentProps) => {
    const manager = createMemo(() => {
        return {} as WebSocketManager;
    });

    return (
        <WebSocketContext.Provider value={manager()}>
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

export const useWebSocket = <K extends keyof WebSocketManager>(endpoint: K, autoReconnect: boolean = false) => {
    const manager = useWebSockets();

    if (!manager[endpoint]) {
        manager[endpoint] = createWebSocketClient(wsEndpoints[endpoint], autoReconnect);
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
