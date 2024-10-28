import { derive, ref } from 'hywer';
import { ProgressTargetsList, ProgressMessage, ProgressStatuses } from '@/data/types';
import { SelectionArea, SelectionItem } from '@/ui/components/selectionArea/SelectionArea';
import { ContentStack, FlexBox, VerticalStack, Window, WindowControls } from '@/ui/components/window/Window';
import { ProgressDisplay } from '@/ui/widgets/progressDisplay/ProgressDisplay';
import Input from '@/ui/components/input/Input';
import { For } from 'hywer/x/html';
import Button from '@/ui/components/buttons/Buttons';
import CreateWindowInstance, { contentStackStates } from './createWindow';
import exampleImage from './s_marks-09_4x.png';
import { DisplayIcon } from '@/ui/components/displayIcon/DisplayIcon';
import { ImageBrowser } from '@/ui/widgets/imageBrowser/ImageBrowser';
import WSStoreInstance from '@/data/stores/WebSocket/store';
import { wsNames } from '@/data/stores/WebSocket/types';
import { InstanceGrid, InstanceGridChildren } from '@/ui/components/grid/Grid';
import { ScanProgress } from '@/ui/widgets/scanProgress/ScanProgress';
import ScanStoreInstance from '@/data/stores/Instance/store';
import { CheckedScanData } from '@/data/stores/Instance/types';


const Instances = () => {
    const selectedLoaderNumber = ref(0);
    const progressItems = ref<ProgressTargetsList>({
        message_id: 'uninitialized',
        message_type: '',
        timestamp: '',
        ids_list: []
    });

    const progressMessage = ref<ProgressMessage>({
        message_id: "uninitialized",
        message_type: "",
        timestamp: "",
        data: {
            stage: ProgressStatuses.PENDING,
            determinable: false,
            progress: 0,
            max: 0,
            status: ProgressStatuses.PENDING,
            target_type: "FILE",
            target: {
                status: "",
                name: "",
                size_bytes: 0
            }
        }
    });

    const Loaders = [
            {
                "name": "Vanilla",
            },
            {
                "name": "Fabric",
            }
    ];


    const handleLoaderChange = (key: number) => {
        selectedLoaderNumber.val = key;
    }

    const handleNameChange = (e: InputEvent) => {
        const input = e.target as HTMLInputElement;
        CreateWindowInstance.selectedInstanceName = input.value;
    }

    CreateWindowInstance.contentStackIndex.sub = (val) => {
        if (val === contentStackStates.ProgressDisplay) {
            CreateWindowInstance.requestVersionDownload();
        }
    }

    const handleCancelClick = () => {
        if (CreateWindowInstance.contentStackIndex.val === 0) {
            windowCreationShown.val = false;
        } else {
            CreateWindowInstance.previousWindow();
        }
    }

    const handleInstanceLaunch = (name: string, url: string) => {
        CreateWindowInstance.requestInstanceLaunch(name);
    }

    const openImageBrowser = () => {
        windowImageBrowser.val = true;
    }

    const instanceImageUri = ref("");

    const windowCreationShown = ref(false);
    const windowImageBrowser = ref(false);

    setTimeout(() => {
        WSStoreInstance.subscribe(wsNames.initInstance, (data) => {
            const msg = JSON.parse(data);
            console.log(msg);

            if (msg.message_type === "PROGRESS_TARGETS_LIST") {
                progressItems.val = msg as ProgressTargetsList;
            } else if (msg.data) {
                progressMessage.val = msg as ProgressMessage;
            } else if (msg.error) {
                console.error(`TODO: Show error message on errors\n${msg.error}`);
            } else if (msg.message_id === "process_finished") {
                if (msg.target && msg.target.integrity && msg.target.info) {
                    let scanDataObject = msg.target as CheckedScanData;
                    ScanStoreInstance.pushScanData(scanDataObject);
                }
            }
        })
    })

    ScanStoreInstance.scanData.derive(val => {
        console.log(val);
    })

    return (
        <>
            <ScanProgress></ScanProgress>
            <InstanceGrid>
                {
                    ScanStoreInstance.scanData.derive(val => {
                        return Object.entries(val).map(([key, value], index) => (
                            <InstanceGridChildren
                                name={value.info.name}
                                loader={value.info.loader}
                                version={value.info.version}
                                onClick={() => handleInstanceLaunch(value.info.name)}
                            />
                        ))
                    })
                }
            </InstanceGrid>
            <button onClick={() => windowCreationShown.val = true}>Create</button>
            <ImageBrowser
                zIndex={1}
                applyVal={instanceImageUri}
                shown={windowImageBrowser}
            />
            <Window
                name="Instance Creation"
                minimize={true}
                maximize={true}
                shown={windowCreationShown}
            >
                <ContentStack showIndex={CreateWindowInstance.contentStackIndex}>
                    <div>
                        <FlexBox>
                            <DisplayIcon
                                style="width: 141px; height: 141px"
                                onClick={openImageBrowser}
                            >
                                <img src={instanceImageUri.derive(val => val)} alt="" />
                            </DisplayIcon>
                            <VerticalStack>
                                <Input id="name" name="Name" style="width: 200px" onInput={handleNameChange} />
                                <Input id="tags" name="Tags" style="width: 200px" />
                            </VerticalStack>
                        </FlexBox>
                        <FlexBox expand={true}>
                            <SelectionArea
                                selectedValue={CreateWindowInstance.selectedVersionId}
                                onValueChange={CreateWindowInstance.handleVersionChange}
                                name="Versions"
                                searchBar={true}>
                                {CreateWindowInstance.versionsManifest.derive(val => {
                                    return <For in={val.versions}>
                                        {(item, i) => {
                                            return <SelectionItem
                                                name={item.id}
                                                onClick={() => CreateWindowInstance.handleVersionChange(item.id, item.url, item.type)}
                                                selected={CreateWindowInstance.selectedVersionId.val == item.id}
                                            />
                                        }}
                                    </For>
                                })}
                            </SelectionArea>
                            <SelectionArea
                                selectedValue={CreateWindowInstance.selectedVersionId}
                                onValueChange={CreateWindowInstance.handleVersionChange}
                                name="Loader">
                                <For in={Loaders}>
                                    {(loader, i) => {
                                        return <SelectionItem
                                            name={loader.name}
                                            onClick={() => handleLoaderChange(i)}
                                            selected={selectedLoaderNumber.val == i}
                                        />
                                    }}
                                </For>
                            </SelectionArea>
                        </FlexBox>
                    </div>
                    <div>
                        <ProgressDisplay progressItems={progressItems} message={progressMessage} />
                    </div>
                </ContentStack>
                <WindowControls>
                    <Button text="Cancel" onClick={handleCancelClick} />
                    <Button text="Continue" primary={true} onClick={() => CreateWindowInstance.contentStackIndex.val++} />
                </WindowControls>
            </Window>
        </>
    );
};

export default Instances;
