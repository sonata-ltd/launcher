import { createEffect, createSignal, For } from "solid-js";
import Button from "uikit/components/Button";
import { ButtonSizes } from "uikit/components/Button/button";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { Input } from "uikit/components/Input";
import { DescriptionText, OptionsSection } from "uikit/components/Section/section";
import { httpCoreApi } from "lib/httpCoreApi";
import { InstanceOptionPage } from "../instanceOptionsWindow";
import { validateMessageType } from "lib/wsManagment";
import { expectedType, tryValidateMessageAs } from "lib/msgBindings/parse";
import { optionUpdateMessageSchema } from "lib/msgBindings/bindings/instance/options/OptionUpdateMessage";
import { instanceFieldsSchema } from "lib/msgBindings/bindings/instance/InstanceFields";
import { exportTypesSchema } from "lib/msgBindings";
import { z } from "zod";

type ExportType = z.infer<typeof exportTypesSchema>;

export const OverviewPage = () => {
    const [name, setName] = createSignal<string | undefined>();
    const [changedName, setChangedName] = createSignal<string | undefined>();
    const [nameApplyActive, setNameApplyActive] = createSignal(false);
    const [tags, setTags] = createSignal<string | undefined>();

    const exportTypesValues = exportTypesSchema.options;
    const [chosenExportType, setChosenExportType] = createSignal<ExportType>("Sonata");

    const selectExportType = (type: ExportType) => {
        setChosenExportType(type);
    }

    const changeName = () => {
        console.log(changedName());
    }

    const checkChangedName = (ev: InputEvent) => {
        setChangedName((ev.target as HTMLInputElement).value);

        if (changedName() !== name()) {
            setNameApplyActive(true);
        } else {
            setNameApplyActive(false);
        }
    }

    createEffect(() => {
        const run = async () => {
            const raw = await httpCoreApi().getInstanceOptionsData(10, InstanceOptionPage.Overview);
            const parsed = tryValidateMessageAs(optionUpdateMessageSchema, raw, expectedType.option);
            if (parsed.success) {
                const safeOption = instanceFieldsSchema.parse(parsed.payload.option);
                if ("Overview" in safeOption) {
                    const data = safeOption.Overview;
                    console.log(data);

                    setName(data.name || undefined);
                    setTags(data.tags || undefined);

                    if (data.export_type)
                        setChosenExportType(data.export_type);
                }
            } else {
                console.error("Validation failed: ", parsed.error);
            }
        }

        run();
    })

    return (
        <>
            <OptionsSection label="Name">
                <Input value={name()} onInput={(ev) => checkChangedName(ev)} width={265}>
                    <Button disabled={!nameApplyActive()} secondary onClick={changeName}>Apply</Button>
                </Input>
            </OptionsSection>
            <OptionsSection label="Tags">
                <Input value={tags()} placeholder="Empty" width={265}>
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
                    <For each={exportTypesValues}>
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
