import {
	Component,
	createEffect,
	createSignal,
	createUniqueId,
	For,
	Show,
} from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import css from "./selectableTable.module.less";

export interface ColumnDef {
	header: string | JSX.Element | null;
	width?: string;
	align?: "left" | "center" | "right";
}

export interface Row<CellsTuple> {
	cells: CellsTuple | string;
	disabled?: boolean;
}

export type NavigationDirection = "first" | "next" | "prev" | "last";

export type InteractionMode = "interactive" | "composite";

export function createSelectableTable<const Cols extends readonly ColumnDef[]>(
	columns: Cols,
) {
	type CellsTuple = { [K in keyof Cols]: JSX.Element };
	type TableRow = Row<CellsTuple>;

	interface SelectableTableProps {
		rows?: TableRow[];
		value?: string | number | null;
		onChange?: (id: string | number) => void;
		placeholder?: JSX.Element;
		label?: string;
		mode?: InteractionMode;
		autoScroll?: boolean;
		"aria-label"?: string;
		"aria-labelledby"?: string;
	}

	const SelectableTable: Component<SelectableTableProps> = (props) => {
		const tableId = createUniqueId();
		const getRowId = (i: number): string => `${tableId}-row-${i}`;

		const rowRefs = new Map<number, HTMLButtonElement>();

		const [focusedIndex, setFocusedIndex] = createSignal(-1);
		const [error, setError] = createSignal(false);

		const rowLimit = 999;
		createEffect(() => {
			if (!props.rows) return;

			if (props.rows.length > rowLimit) {
				setError(true);
			} else {
				setError(false);
			}
		});

		const mode = (): InteractionMode => props.mode ?? "interactive";
		const autoScroll = (): boolean => props.autoScroll ?? true;

		// Indicies of all enabled elements
		// Used for navigation - skip disable elements
		const enabledIndices = (): number[] => {
			if (!props.rows) return [];

			return props.rows
				.map((row, i) => ({ row, i }))
				.filter(({ row }) => !row.disabled)
				.map(({ i }) => i);
		};

		const activeDescendantId = (): string | undefined => {
			const idx = focusedIndex();
			return idx >= 0 ? getRowId(idx) : undefined;
		};

		const getRowTabIndex = (row: TableRow, i: number): number => {
			if (row.disabled) return -1;

			// Selected value gets 0
			if (props.value === i) return 0;

			// Virtual focused value gets 0
			if (focusedIndex() === i) return 0;

			// If nothing selected and nothing focused - first element gets 0
			if (props.value == null && focusedIndex() === -1) {
				const firstEnabled = enabledIndices()[0];
				if (i === firstEnabled) return 0;
			}

			return -1;
		};

		const navigate = (direction: NavigationDirection): void => {
			const indices = enabledIndices();
			if (indices.length === 0) return;

			const currentId = focusedIndex();
			const currentPosition = indices.indexOf(currentId);

			let nextIndex: number;

			switch (direction) {
				case "first":
					nextIndex = indices[0];
					break;

				case "next":
					if (currentPosition === -1) {
						nextIndex = indices[0];
					} else if (currentPosition < indices.length - 1) {
						nextIndex = indices[currentPosition + 1];
					} else {
						return;
					}
					break;

				case "prev":
					if (currentPosition === -1) {
						nextIndex = indices[indices.length - 1];
					} else if (currentPosition > 0) {
						nextIndex = indices[currentPosition - 1];
					} else {
						return;
					}
					break;

				case "last":
					nextIndex = indices[indices.length - 1];
					break;
			}

			setFocusedIndex(nextIndex);

			if (mode() === "interactive") {
				rowRefs.get(nextIndex)?.focus();
			}
		};

		const handleRowKeyDown = (e: KeyboardEvent): void => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					navigate("next");
					break;

				case "ArrowUp":
					e.preventDefault();
					navigate("prev");
					break;

				case "Home":
					e.preventDefault();
					navigate("first");
					break;

				case "End":
					e.preventDefault();
					navigate("last");
					break;
			}
		};

		return (
			<div
				class={css["wrapper"]}
				role="listbox"
				aria-label={
					props["aria-labelledby"]
						? undefined
						: props["aria-label"] ?? "Choose element"
				}
				aria-labelledby={props["aria-labelledby"]}
				aria-activedescendant={
					mode() === "composite" ? activeDescendantId() : undefined
				}
				tabIndex={mode() === "composite" ? 0 : undefined}
			>
				<Show when={props.label}>
					<p class={css["label"]}>{props.label}</p>
				</Show>
				<div class={css["container"]}>
					{/* Header */}
					<div
						class={css["header-container"]}
						role="presentation"
						aria-hidden="true"
					>
						<For each={columns}>
							{(col) => {
								return (
									<p
										class={css["header-cell"]}
										style={{
											width: col.width,
											"text-align": col.align,
										}}
									>
										{col.header}
									</p>
								);
							}}
						</For>
					</div>

					{/* Body */}
					<div class={css["body"]}>
						<Show
							when={props.rows}
							fallback={
								<p class={css["fallback-message"]}>
									This table is empty
								</p>
							}
						>
							<For each={props.rows}>
								{(row, i) => (
									<button
										ref={(el) => {
											if (el) rowRefs.set(i(), el);
										}}
										id={getRowId(i())}
										type="button"
										role="option"
										aria-selected={props.value === i()}
										disabled={row.disabled}
										tabIndex={getRowTabIndex(row, i())}
										class={css["row"]}
										classList={{
											[css["row-even"]]: i() % 2 !== 0,
											[css["row-selected"]]:
												props.value === i(),
										}}
										onClick={() => {
											if (!row.disabled) {
												setFocusedIndex(i());
												props.onChange?.(i());
											}
										}}
										onFocus={() => setFocusedIndex(i())}
										onKeyDown={handleRowKeyDown}
									>
										<For
											each={
												row.cells as
													| JSX.Element[]
													| string[]
											}
										>
											{(cell, i) => {
												if (typeof cell === "string") {
													return (
														<p
															class={
																css[
																	"cell-string"
																]
															}
														>
															{cell}
														</p>
													);
												} else {
													return (
														<span
															class={
																css["cell-any"]
															}
														>
															{cell}
														</span>
													);
												}
											}}
										</For>
									</button>
								)}
							</For>
						</Show>
					</div>
				</div>
			</div>
		);
	};

	return {
		Component: SelectableTable,
		columns,
		createRow: (
			cells: CellsTuple | string,
			disabled?: boolean,
		): TableRow => ({
			cells,
			disabled,
		}),
	};
}
