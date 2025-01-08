import { Component, createEffect, createSignal, For } from "solid-js";
import Card from "uikit/components/Card";

import css from "./instances.module.less";
import { useWebSockets } from "data/wsManagment";
import { createStore } from "solid-js/store";
import { InstancesStateProvider, useInstancesState } from "data/instancesManagment";
import Button from "uikit/components/Button";
import { FlexBox, VerticalStack, Window } from "uikit/components/Window";
import { ButtonConfig, ContentStack, WindowControls } from "uikit/components/Window";
import { ButtonTypes } from "uikit/components/Button/button";
import { Input } from "uikit/components/Input";
import { ImageBrowser } from "uikit/widgets/ImageBrowser/imageBrowser";
import { Portal } from "solid-js/web";


type InstanceInfo = {
    loader: string,
    name: string,
    version: string
}

const Page: Component = () => {
    const [instances] = useInstancesState();

    const [isWindowVisible, setWindowVisible] = createSignal(false);
    const [windowIndex, setWindowIndex] = createSignal(0);
    const [prevWindowIndex, setPrevWindowIndex] = createSignal<undefined | number>(undefined);

    const buttonConfig = [
        [
            {
                label: "Cancel",
                action: () => closeWindow(),
                type: ButtonTypes.secondary,
            },
            {
                label: "Install",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => closeWindow(),
                type: ButtonTypes.primary,
            }
        ]
    ]

    const currentButtons = () => buttonConfig[windowIndex()];

    const enableCreateWindow = () => {
        setWindowVisible(true);
    }

    const changeWindowIndex = (increment: boolean) => {
        setPrevWindowIndex(windowIndex());

        if (increment)
            setWindowIndex((prev) => prev + 1);
        else
            setWindowIndex((prev) => prev - 1);
    }

    const closeWindow = () => {
        setWindowVisible(false);
    }

    return (
        <>
            <Portal>
                <ImageBrowser>
                </ImageBrowser>
            </Portal>
            <Portal>
                <Window
                    visible={isWindowVisible}
                    setVisible={setWindowVisible}
                    controlsConfig={currentButtons}
                >
                    <ContentStack
                        index={windowIndex}
                        prevIndex={prevWindowIndex}
                    >
                        <div>
                            <FlexBox expand>
                                <Input
                                    label="Name"
                                />
                                <Input
                                    label="Tags"
                                />
                            </FlexBox>
                        </div>
                        <p>section 2</p>
                        <h1>section 3</h1>
                    </ContentStack>
                    {/* <WindowControls>
                        <Button secondary onClick={() => changeWindowIndex(false)}>Back</Button>
                        <Button primary onClick={() => changeWindowIndex(true)}>Next</Button>
                    </WindowControls> */}
                </Window>
            </Portal>
            <div class={css.InstancesWrapper}>
                <div class={css.PageContent}>
                    <Button secondary onClick={() => enableCreateWindow()}>Create</Button>
                    <div class={css.InstancesContainer}>
                        <For each={instances()}>{(instance, i) =>
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
