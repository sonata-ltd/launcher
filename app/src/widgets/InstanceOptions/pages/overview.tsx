import { createSignal, For } from "solid-js"
import Button from "uikit/components/Button"
import { ButtonSizes } from "uikit/components/Button/button";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { Input } from "uikit/components/Input"
import css from "../instanceOptions.module.less";
import { DescriptionText, OptionsSection } from "uikit/components/Section/section";

enum InstanceExportType {
    SonataType = "Sonata Type",
    MultiMC = "MultiMC Compatible",
    Modrinth = "Modrinth"
}

export const OverviewPage = () => {
    const instanceExportArray = Object.values(InstanceExportType);
    const [chosenExportType, setChosenExportType] = createSignal<InstanceExportType>(instanceExportArray[0]);

    const selectExportType = (index: number) => {
        setChosenExportType(instanceExportArray[index]);
    }

    return (
        <>
            <OptionsSection label="Name">
                <Input value="Snipperly SMP" width={265}>
                    <Button secondary>Apply</Button>
                </Input>
            </OptionsSection>
            <OptionsSection label="Tags">
                <Input value="SMP, Fabric, Modded" width={265}>
                    <Button secondary>Apply</Button>
                </Input>
            </OptionsSection>
            <OptionsSection label="Export Instance">
                <Dropdown
                    width={265}
                    typeable={false}
                    value={chosenExportType()}
                    onChange={selectExportType}
                    actionChildren={
                        <>
                            <Button secondary>Export</Button>
                        </>
                    }
                >
                    <For each={instanceExportArray}>
                        {(item) => (
                            <Dropdown.Item value={item} searchValue={item}>
                                {item}
                            </Dropdown.Item>
                        )}
                    </For>
                </Dropdown>
            </OptionsSection>
            <OptionsSection label="Delete Instance" gapContent>
                <DescriptionText>
                    Permanently deletes an instance from your device, including your worlds, configs, and all installed content. Be careful, as once you delete a instance there is no way to recover it.
                </DescriptionText>
                <Button secondary size={ButtonSizes.md}>Delete</Button>
            </OptionsSection>
        </>
    )
}
