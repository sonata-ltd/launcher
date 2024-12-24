import { Component, createEffect, createSignal, For } from "solid-js";
import Card from "uikit/components/Card";

import css from "./instances.module.less";
import { useWebSockets } from "data/wsManagment";
import { createStore } from "solid-js/store";
import { InstancesStateProvider, useInstancesState } from "data/instancesManagment";
import Button from "uikit/components/Button";
import { Window } from "uikit/components/Window";
import { ContentStack, WindowControls } from "uikit/components/window/window";


type InstanceInfo = {
    loader: string,
    name: string,
    version: string
}

const Page: Component = () => {
    const instances = useInstancesState();

    createEffect(() => {
        console.log(instances);
    });

    const [isWindowVisible, setWindowVisible] = createSignal(false);
    const [windowIndex, setWindowIndex] = createSignal(0);

    const enableCreateWindow = () => {
        setWindowVisible(true);
    }

    const changeWindowIndex = (increment: boolean) => {
        if (increment)
            setWindowIndex((prev) => prev + 1);
        else
            setWindowIndex((prev) => prev - 1);
    }

    return (
        <>
            <Window
                visible={isWindowVisible}
                setVisible={setWindowVisible}
            >
                <ContentStack index={windowIndex}>
                    <p>asdasd</p>
                    <p>123123</p>
                    <p>iu4w7ybvjd</p>
                </ContentStack>
                <WindowControls>
                    <Button secondary onClick={() => changeWindowIndex(false)}>Back</Button>
                    <Button primary onClick={() => changeWindowIndex(true)}>Next</Button>
                </WindowControls>
            </Window>
            <div class={css.InstancesWrapper}>
                <div class={css.PageContent}>
                    <Button secondary onClick={() => enableCreateWindow()}>Create</Button>
                    <div class={css.InstancesContainer}>
                        <For each={instances}>{(instance, i) =>
                            <Card
                                name={instance.name}
                                description="Fabric 1.20.1"
                            />
                        }
                        </For>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page;
