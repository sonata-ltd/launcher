import { Component, createEffect, createSignal } from "solid-js";
import Button from "uikit/components/Button";
import { Input } from "uikit/components/Input";
import { Tabs } from "uikit/components/Tabs/tabs";
import { ChevronIcon } from "uikit/icons/components/chevron";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";
import ddCss from "uikit/components/Dropdown/dropdown.module.less";
import { TextArea } from "uikit/components/TextArea/textarea";
import { ProgressBar } from "uikit/components/Progress";
import {
	createSelectableTable,
	Row,
} from "uikit/components/SelectableTable/selectableTable";
import { openWindow } from "lib/windowManager/store";
import { RuntimeSelectionWindow } from "windows/RuntimeSelection/runtimeSelectionWindow";

function generateRows(columnsCount: number, count = 1000) {
	const words = [
		"Alpha",
		"Beta",
		"Gamma",
		"Delta",
		"Omega",
		"Solid",
		"JS",
		"Table",
		"Row",
		"Cell",
	];

	const random = (min: number, max: number) =>
		Math.floor(Math.random() * (max - min + 1)) + min;

	return Array.from({ length: count }, (_, rowIndex) => ({
		cells: Array.from(
			{ length: columnsCount },
			(_, colIndex) =>
				`${words[random(0, words.length - 1)]} ${rowIndex}-${colIndex}`,
		),
		// примерно каждая 10-я строка будет disabled
		disabled: Math.random() < 0.1,
	}));
}

export const SelectableTableDebug: Component = () => {
	const userTable = createSelectableTable([
		{ header: "ID" },
		{ header: "Name" },
		{ header: "Email" },
	] as const);

	const [selected, setSelected] = createSignal<number | null>(null);
	const [generateCount, setGenerateCount] = createSignal(25);
	const [generatedRows, setGeneratedRows] = createSignal<undefined | any>(
		undefined,
	);

	createEffect(() => {
		setGeneratedRows(generateRows(3, generateCount()));
	});

	const handleInput = (e: Event) => {
		console.log(e.target.value);
		const value = (e.target as HTMLInputElement).value;
		setGenerateCount(value);
	};

	const useRuntimeSelectionWindow = async () => {
		const result = await openWindow<null, null>(
			RuntimeSelectionWindow,
			null,
		);

		if (result) {
			console.log(result);
		}
	};

	return (
		<>
			<Input
				type="number"
				value={generateCount().toString()}
				onInput={(e) => handleInput(e)}
			/>
			<div
				style={`width: 800px; height: 200px; background: transparent; margin: 25px 25px;`}
			>
				<userTable.Component
					rows={generatedRows()}
					value={selected()}
					onChange={setSelected}
					aria-label="Users list"
				/>
				<p>Selected: {selected()}</p>
			</div>
		</>
	);
};
