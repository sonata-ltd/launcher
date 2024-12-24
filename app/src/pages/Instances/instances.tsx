import { Component, createEffect, createSignal, For } from "solid-js";
import Card from "uikit/components/Card";

import css from "./instances.module.less";
import { useWebSockets } from "data/wsManager";
import { createStore } from "solid-js/store";


type InstanceInfo = {
    loader: string,
    name: string,
    version: string
}

const Page: Component = () => {
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
    });

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


    return (
        <>
            <p>Instances</p>
            <button onClick={() => addTab()}>asdasd</button>
            <div class={css.InstancesContainer}>
                <For each={instances}>{(instance, i) =>
                    <Card
                        name={instance.name}
                        description="Fabric 1.20.1"
                    />
                }
                </For>
            </div>
        </>
    )
}

export default Page;
