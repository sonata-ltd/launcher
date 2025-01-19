import { Component, createEffect, createSignal, For, lazy } from "solid-js";
import Card from "uikit/components/Card";

import css from "./instances.module.less";
import { useWebSockets } from "lib/wsManagment";
import { createStore } from "solid-js/store";
import { InstancesStateProvider, useInstancesState } from "lib/instancesManagment";
import Button from "uikit/components/Button";
import { FlexBox, VerticalStack, Window } from "uikit/components/Window";
import { ButtonConfig, ContentStack, WindowControls } from "uikit/components/Window";
import { ButtonTypes } from "uikit/components/Button/button";
import { Input } from "uikit/components/Input";
import { ImageBrowser } from "uikit/widgets/ImageBrowser/imageBrowser";
import { Portal } from "solid-js/web";
import { createWindowModel } from "./windowModels/createWindow";
import { imageBrowserModel } from "./windowModels/imageBrowserModel";


type InstanceInfo = {
    loader: string,
    name: string,
    version: string
}

const Page: Component = () => {
    const [instances] = useInstancesState();
    const useCreateWindowModel = createWindowModel();
    const useImageBrowserModel = imageBrowserModel();

    return (
        <>
            <Portal>
                <ImageBrowser
                    visible={useImageBrowserModel.imageBrowserVisible}
                    setVisible={useImageBrowserModel.setImageBrowserVisible}
                    setImageSrc={useImageBrowserModel.setImageSrc}
                />
            </Portal>
            <Portal>
                <Window
                    visible={useCreateWindowModel.isWindowVisible}
                    setVisible={useCreateWindowModel.setWindowVisible}
                    controlsConfig={useCreateWindowModel.currentButtons}
                >
                    <ContentStack
                        index={useCreateWindowModel.windowIndex}
                        prevIndex={useCreateWindowModel.prevWindowIndex}
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
                </Window>
            </Portal>
            <div class={css.InstancesWrapper}>
                <div class={css.PageContent}>
                    <Button secondary onClick={() => useCreateWindowModel.enableCreateWindow()}>Create</Button>
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
