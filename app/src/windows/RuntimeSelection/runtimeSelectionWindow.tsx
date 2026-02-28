import { useTranslatedMessages } from "lib/localization/useMessages";
import { WindowComponentProps } from "lib/windowManager/types";
import { Component, createEffect, createSignal } from "solid-js";
import Dropdown from "uikit/components/Dropdown/dropdown";
import {
	ButtonConfig,
	ContentWrapper,
	FlexBox,
	VerticalStack,
	WindowFrame,
} from "uikit/components/Window";
import css from "./runtimeSelectionWindow.module.less";
import Button from "uikit/components/Button";
import { createSelectableTable } from "uikit/components/SelectableTable/selectableTable";
import { ButtonTypes } from "uikit/components/Button/button";
import { TrashIcon } from "components/Icons/trash-03";
import { PlusIcon } from "uikit/icons/components/plus";
import { openWindow } from "lib/windowManager/store";
import { ManualAdditionWindow } from "./ManualAdditionWindow/manualAdditionWindow";

type RuntimeShowCategory = "show_all" | "external" | "managed";

export const RuntimeSelectionWindow: Component<
	WindowComponentProps<null, null>
> = (props) => {
	const { get } = useTranslatedMessages();

	const [showRuntimeCategory, setShowRuntimeCategory] =
		createSignal<RuntimeShowCategory>("show_all");

	const managedRuntimesTable = createSelectableTable([
		{ header: get("path") },
		{ header: get("vendor") },
		{ header: get("major_version") },
	] as const);

	const useManualAdditionWindow = async () => {
		const result = await openWindow<null, null>(
			ManualAdditionWindow,
			null,
			{},
		);
	};

	createEffect(() => {
		useManualAdditionWindow();
	});

	return (
		<WindowFrame
			name={get("runtime_selection")}
			onClose={props.close}
			width={700}
			controlsConfig={
				[
					{
						label: get("unset"),
						action: () => {},
						type: ButtonTypes.tertiary,
						last: true,
					},
					{
						label: get("cancel"),
						action: () => {},
						type: ButtonTypes.secondary,
					},
					{
						label: get("select"),
						action: () => {},
						type: ButtonTypes.primary,
					},
				] as ButtonConfig[]
			}
		>
			<ContentWrapper>
				<VerticalStack>
					<FlexBox class={css["top-bar"]} center>
						<Dropdown
							value={showRuntimeCategory()}
							onChange={(c) => setShowRuntimeCategory(c)}
							width={130}
						>
							<Dropdown.Item
								value={"show_all" as RuntimeShowCategory}
								searchValue="all"
							>
								Show All
							</Dropdown.Item>
							<Dropdown.Item
								value={"external" as RuntimeShowCategory}
								searchValue="external"
							>
								External
							</Dropdown.Item>
							<Dropdown.Item
								value={"managed" as RuntimeShowCategory}
								searchValue="managed"
							>
								Managed
							</Dropdown.Item>
						</Dropdown>
						<FlexBox gap={5} center fill>
							<p class={css["runtime-name"]}>Azul 12</p>
							<p class={css["runtime-details"]}>
								— Already installed (external)
							</p>
						</FlexBox>
						<FlexBox gap={10}>
							<Button
								secondary
								icon
								onClick={useManualAdditionWindow}
							>
								<PlusIcon />
							</Button>
							<Button destructive icon>
								<TrashIcon />
							</Button>
						</FlexBox>
					</FlexBox>
					<managedRuntimesTable.Component
						label={get("external_runtimes")}
					/>
				</VerticalStack>
			</ContentWrapper>
		</WindowFrame>
	);
};
