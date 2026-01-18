import {
  createComputed,
  createEffect,
  createRenderEffect,
  createResource,
  createSignal,
  For,
  onMount,
} from "solid-js";
import Button from "uikit/components/Button";
import { ButtonSizes } from "uikit/components/Button/button";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { Input } from "uikit/components/Input";
import {
  DescriptionText,
  OptionsSection,
} from "uikit/components/Section/section";
import { httpCoreApi } from "lib/httpCoreApi";
import {
  InstanceOptionPage,
  InstancePageProps,
} from "../instanceOptionsWindow";
import { validateMessageType } from "lib/wsManagment";
import { tryValidateMessageAs } from "lib/msgBindings/parse";
import { optionUpdateMessageSchema } from "lib/msgBindings/bindings/instance/options/OptionUpdateMessage";
import { instanceFieldsSchema } from "lib/msgBindings/bindings/instance/InstanceFields";
import { exportTypesSchema, overviewFieldsSchema } from "lib/msgBindings";
import { z } from "zod";
import { useInstancesState } from "lib/instancesManagment";
import { debugComputation } from "@solid-devtools/logger";
import { TrashIcon } from "components/Icons/trash-03";

type ExportType = z.infer<typeof exportTypesSchema>;

export const OverviewPage = (props: InstancePageProps) => {
  const [name, setName] = createSignal<string>();

  const [changedName, setChangedName] = createSignal<string>();
  const [nameApplyActive, setNameApplyActive] = createSignal(false);

  const [tags, setTags] = createSignal<string>();

  const exportTypesValues = exportTypesSchema.options;
  const [chosenExportType, setChosenExportType] =
    createSignal<ExportType>("Sonata");

  const [data, { refetch }] = createResource(
    () => props.id,
    async (id) => {
      const raw = await httpCoreApi().getInstanceOptionsData(
        id,
        InstanceOptionPage.Overview,
      );
      const parsed = tryValidateMessageAs("option", raw);
      if (parsed.success) {
        const safeOption = instanceFieldsSchema.parse(parsed.payload.option);
        if ("Overview" in safeOption) {
          return safeOption.Overview;
        }
      } else {
        console.error("Validation failed: ", parsed.error);
      }
    },
  );

  const selectExportType = (type: ExportType) => {
    setChosenExportType(type);
  };

  const changeName = async () => {
    const newName = changedName();
    if (!newName) return;

    try {
      await httpCoreApi().changeInstanceOptionsData(
        props.id,
        InstanceOptionPage.Overview,
        {
          name: newName,
        } as z.infer<typeof overviewFieldsSchema>,
      );

      setNameApplyActive(false);
      setName(newName);
      props.updateName(newName);
    } catch (err) {
      console.trace(`Failed to update instance options data: ${err}`);
    }
  };

  const checkChangedName = (ev: InputEvent) => {
    setChangedName((ev.target as HTMLInputElement).value);

    if (changedName() !== name()) {
      setNameApplyActive(true);
    } else {
      setNameApplyActive(false);
    }
  };

  createEffect(() => {
    const d = data();
    if (!d) return;

    try {
      setName(d.name!);
      setTags(d.tags!);

      if (d.export_type) setChosenExportType(d.export_type);
    } catch (err) {
      console.log(err);
    }
  });

  return (
    <>
      <OptionsSection label="Name">
        <Input
          value={name()}
          onInput={(ev) => checkChangedName(ev)}
          width={265}
        >
          <Button disabled={!nameApplyActive()} secondary onClick={changeName}>
            Apply
          </Button>
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
          Permanently deletes an instance from your device, including your
          worlds, configs, and all installed content. Be careful, as once you
          delete a instance there is no way to recover it.
        </DescriptionText>
        <Button primary destructive icon size={ButtonSizes.md}>
          <TrashIcon />
          Delete
        </Button>
      </OptionsSection>
    </>
  );
};
