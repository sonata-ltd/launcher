import { createContext, useContext, JSX } from "solid-js";
import { createStore, Store } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import { wsNames } from "./types";


interface ManagedWebSocket {
  state: () => WebSocketState;
  messages: Store<string[]>;
  sendMessage: (message: string) => void;
  close: () => void;
}

type WebSocketState = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";

type WebSocketMap = Record<string, ManagedWebSocket>;

const WebSocketContext = createContext<WebSocketMap>();


function createManagedWebSocket(
  url: string,
  options: { reconnect?: boolean; reconnectDelay?: number } = {}
): ManagedWebSocket {
  const { reconnect = true, reconnectDelay = 5000 } = options;
  const [state, setState] = createSignal<WebSocketState>("CLOSED");
  const [messages, setMessages] = createStore<string[]>([]);
  let socket: WebSocket | undefined;
  let reconnecting = true;


  const connect = () => {
    setState("CONNECTING");
    socket = new WebSocket(url);

    socket.onopen = () => setState("OPEN");
    socket.onclose = () => {
      setState("CLOSED");
      if (reconnect && reconnecting) {
        setTimeout(connect, reconnectDelay);
      }
    };
    socket.onerror = () => setState("ERROR");
    socket.onmessage = (event) => setMessages((msgs) => [...msgs, event.data]);
  };

  connect();


  const close = () => {
    reconnecting = false;
    socket?.close();
  };
  onCleanup(close);


  const sendMessage = (message: string) => {
    if (state() === "OPEN") {
      socket?.send(message);
    } else {
      console.warn("WebSocket is not open.");
    }
  };

  return { state, messages, sendMessage, close };
}

export function WebSocketProvider(props: { children: JSX.Element }) {

  // Dynamically create websockets connections
  const [sockets, setSockets] = createStore<WebSocketMap>(
    Object.fromEntries(
      Object.entries(wsNames).map(([key, url]) => [
        key,
        createManagedWebSocket(url, { reconnect: true, reconnectDelay: 5000 }),
      ])
    )
  );

  return (
    <WebSocketContext.Provider value={sockets}>
      {props.children}
    </WebSocketContext.Provider>
  );
}

export function useWebSockets(): WebSocketMap {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSockets must be used inside WebSocketProvider");
  }
  return context;
}
