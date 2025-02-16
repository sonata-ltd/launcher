import { useWebSockets } from "lib/wsManagment";
import { operationEventSchema, operationUpdateSchema } from "lib/wsManagment/bindings";
import { validateMessageType } from "lib/wsManagment/parser";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { Accessor, createContext, createEffect, createSignal, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";
import { z } from "zod";


enum InstanceStatuses {
    RUNNING,
    OFF
}

type InstanceStatus = {
    instanceId: string,
    status: InstanceStatus
}

type InstanceInfo = {
    loader: string,
    name: string,
    version: string
}

type Store = [
    Accessor<InstanceInfo[]>
]

const InstancesStateContext = createContext<Store>();

export function InstancesStateProvider(props: { children: JSX.Element }) {
    // const sockets = useWebSockets();
    // const { state, messages, sendMessage } = sockets.listInstances;

    const ws = useWebSocket("listInstances");
    const { sendMessage, messages } = ws;

    const [instances, setInstances] = createSignal<InstanceInfo[]>([]);

    const addInstance = (info: InstanceInfo) => {
        setInstances((prev) => [...prev, info]);
    }

    const removeInstance = (info: InstanceInfo) => {
        setInstances((prev) => prev.filter((t) => t !== info));
    }

    createEffect(() => {
        sendMessage("asdasd");
    }, []);

    createEffect(() => {
        if (messages().length > 0) {
            const rawMsg = messages()[messages().length - 1];

            const msg = validateMessageType(rawMsg);
            if (!msg) return;

            switch (msg.type) {
                case "operation":
                    handleOperationMessage(msg.payload.data);
                    break;
                default:
                    console.log("unknown");
            }
        }
    })

    const handleOperationMessage = (data: z.infer<typeof operationEventSchema>) => {
        switch (true) {
            case "start" in data:
                break;
            case "update" in data:
                handleOperationUpdate(data.update);
                break;
            case "finish" in data:
                break;
        }
    }

    const handleOperationUpdate = (data: z.infer<typeof operationUpdateSchema>) => {
        if (
            data.type === "Determinable"
            && data.details.target.type === "Instance"
        ) {
            if (data.details.target.info !== null) {
                const infoSlice = data.details.target.info;

                if (
                    infoSlice?.loader !== undefined
                    && infoSlice.name !== undefined
                    && infoSlice.version !== undefined
                ) {
                    const foundInstance: InstanceInfo = {
                        loader: infoSlice?.loader,
                        name: infoSlice.name,
                        version: infoSlice.version
                    }

                    addInstance(foundInstance);
                }
            }
        } else {
            console.warn("Fields of valid WebSocket message is not found");
        }
    }

    const store: Store = [
        instances
    ]

    return (
        <InstancesStateContext.Provider value={store}>
            {props.children}
        </InstancesStateContext.Provider>
    )
}

export function useInstancesState() {
    const context = useContext(InstancesStateContext);

    if (!context) {
        throw new Error("useInstancesState must be used inside InstancesStateProvider");
    }

    return context;
}
