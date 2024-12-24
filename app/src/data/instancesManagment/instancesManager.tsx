import { useWebSockets } from "data/wsManagment";
import { createContext, createEffect, createSignal, useContext } from "solid-js";
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

const InstancesStateContext = createContext();

export function InstancesStateProvider(props: { children: JSX.Element }) {
    const sockets = useWebSockets();
    const { state, messages, sendMessage } = sockets.listInstances;

    const [instances, setInstances] = createStore<InstanceInfo[]>([]);

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
                console.log(instances);
            }
        }
    })

    return (
        <InstancesStateContext.Provider value={instances}>
            {props.children}
        </InstancesStateContext.Provider>
    )
}

export function useInstancesState() {
    return useContext(InstancesStateContext);
}
