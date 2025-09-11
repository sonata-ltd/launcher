import { createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { useLogger } from "lib/logger";

export type WebSocketState = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";
type MessageHandler = (message: any) => void;

type WebSocketClient = {
    state: () => WebSocketState,
    messages: any[],
    send: (data: any) => void,
    addListener: (handler: MessageHandler) => void,
    removeListener: (handler: MessageHandler) => void
}


export const createWebSocketClient = (url: string, autoReconnect = true, reconnectDelay = 1000): WebSocketClient => {
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
                reconnectTimer = setTimeout(connect, reconnectDelay);
            }
        }

        socket.onerror = (e) => {
            changeState("ERROR");
            socket?.close();

            if (autoReconnect) {
                reconnectTimer = setTimeout(connect, reconnectDelay);
            }
        }

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setMessages((prev) => [...prev, data]);
                listeners.forEach(handler => handler(data));
            } catch (err) {
                console.trace(`Failed to parse message: "${err}" from "${url}"`);
            }
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
