import { Component, For } from "solid-js";
import Card from "uikit/components/Card";

import { useInstancesState } from "lib/instancesManagment";
import Button from "uikit/components/Button";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { Input } from "uikit/components/Input";
import { ContentStack, FlexBox, VerticalStack, Window } from "uikit/components/Window";
import { ImageBrowser } from "uikit/widgets/ImageBrowser/imageBrowser";
import { ProgressDisplay } from "uikit/widgets/ProgressDisplay/progressDisplay";
import css from "./instances.module.less";
import { createWindowModel } from "./windowModels/createWindow";
import { imageBrowserModel } from "./windowModels/imageBrowserModel";


const Page: Component = () => {
    const [{ instances, runInstance, getManifestVersionsMap }] = useInstancesState();

    const useCreateWindowModel = createWindowModel();
    const useImageBrowserModel = imageBrowserModel();


    return (
        <>
            <ImageBrowser
                visible={useImageBrowserModel.imageBrowserVisible}
                setVisible={useImageBrowserModel.setImageBrowserVisible}
                setImageSrc={useImageBrowserModel.setImageSrc}
            />
            <Window
                visible={useCreateWindowModel.isWindowVisible}
                setVisible={useCreateWindowModel.setWindowVisible}
                controlsConfig={useCreateWindowModel.currentButtons}
                name={"Create Instance"}
            >
                <ContentStack
                    index={useCreateWindowModel.windowIndex}
                    prevIndex={useCreateWindowModel.prevWindowIndex}
                >
                    <div>
                        <VerticalStack>
                            <FlexBox expand>
                                <Input
                                    label="Name"
                                    placeholder={useCreateWindowModel.getNamePlaceholder("Instance Name")}
                                    onInput={(e) =>
                                        useCreateWindowModel.setStoreValueFromInput(e, "name")
                                    }
                                />
                                <Input
                                    label="Tags"
                                    placeholder="Instance Tags"
                                />
                            </FlexBox>
                            <Dropdown
                                value={useCreateWindowModel.selectedVersionStore.version}
                                onChange={useCreateWindowModel.selectVersionId}
                                label="Versions"
                                placeholder="Instance Version"
                            >
                                <For each={[...getManifestVersionsMap().values()]}>
                                    {(version) => (
                                        <Dropdown.Item value={version.id} searchValue={version.id}>
                                            {version.id}
                                        </Dropdown.Item>
                                    )}
                                </For>
                            </Dropdown>
                        </VerticalStack>
                    </div>
                    <ProgressDisplay
                        wsMsgs={useCreateWindowModel.getWSMessages}
                        getMessagesTracked={useCreateWindowModel.getMessagesTracked}
                        getWSState={useCreateWindowModel.getWSState}
                    />
                    <p>section 2</p>
                    <h1>section 3</h1>
                </ContentStack>
            </Window>
            <div class={css.InstancesWrapper}>
                <div class={css.PageContent}>
                    <Button secondary onClick={() => useCreateWindowModel.enableCreateWindow()}>Create</Button>
                    <div class={css.InstancesContainer}>
                        <For each={instances()}>{(instance, i) =>
                            <Card
                                name={instance.name}
                                description={`${instance.loader} ${instance.version}`}
                                runFn={() => runInstance(instance.version, instance.name)}
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
