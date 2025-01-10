import { useWebSockets } from "lib/wsManagment";
import { Accessor, createContext, createEffect, createSignal, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";


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
    const sockets = useWebSockets();
    const { state, messages, sendMessage } = sockets.listInstances;

    const [instances, setInstances] = createSignal<InstanceInfo[]>([]);

    const addInstance = (info: InstanceInfo) => {
        setInstances((prev) => [...prev, info]);
    }

    const removeInstance = (info: InstanceInfo) => {
        setInstances((prev) => prev.filter((t) => t !== info));
    }

    createEffect(() => {
        sendMessage("asdasd");
    })

    createEffect(() => {
        if (messages.length > 0) {
            const msg = JSON.parse(messages[messages.length - 1]);

            if (msg.target && msg.target.info) {
                const info = msg.target.info;

                const newInstance: InstanceInfo = {
                    loader: info.loader,
                    name: info.name,
                    version: info.version
                };

                addInstance(newInstance);
            }
        }
    })

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
