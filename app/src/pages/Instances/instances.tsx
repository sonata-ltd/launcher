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
                    <VerticalStack>
                        <FlexBox>
                            <Card
                                size="135px"
                                img={useImageBrowserModel.imageSrc()}
                            >
                                <Button secondary onClick={() => useImageBrowserModel.setImageBrowserVisible(true)}>Change</Button>
                            </Card>
                            <VerticalStack expand>
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
                            </VerticalStack>
                        </FlexBox>
                        <VerticalStack>
                            <Dropdown
                                value={useCreateWindowModel.selectedVersionStore.version}
                                onChange={useCreateWindowModel.selectVersionId}
                                label="Versions"
                                placeholder="Instance Version"
                                typeable
                            >
                                <For each={[...getManifestVersionsMap().keys()]}>
                                    {(version) => (
                                        <Dropdown.Item value={version} searchValue={version}>
                                            {version}
                                        </Dropdown.Item>
                                    )}
                                </For>
                            </Dropdown>
                        </VerticalStack>
                    </VerticalStack>
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
                            >
                                <Button
                                    class={css["button"]}
                                    onClick={() => runInstance(instance)}
                                    secondary
                                >Play</Button>
                                <Button
                                    class={css["button"]}
                                    onClick={() => alert("not impl")}
                                    secondary
                                >Options</Button>
                            </Card>
                        }
                        </For>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page;
