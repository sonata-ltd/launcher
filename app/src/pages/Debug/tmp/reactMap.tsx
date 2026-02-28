import {
	createEffect,
	createMemo,
	createRenderEffect,
	For,
	JSX,
} from "solid-js";
import { SignalPair, useReactiveMap } from "utils/reactiveMap";

export const MapDemo = () => {
	const reactive = useReactiveMap<number>();

	// Начальные данные
	reactive.set("apples", 3);
	reactive.set("oranges", 5);

	// ----------------------------------------------------------
	// Derived-значение
	// Пересчитается ТОЛЬКО если:
	// - изменится список ключей
	// - или значение одного из прочитанных ключей
	// ----------------------------------------------------------
	const total = createMemo(() =>
		reactive.keys().reduce((sum, k) => sum + (reactive.get(k) ?? 0), 0),
	);

	createEffect(() => {
		console.log("Total changed:", total());
	});

	let inputKey!: HTMLInputElement;
	let inputVal!: HTMLInputElement;

	return (
		<div style={{ padding: "20px", "font-family": "Arial, sans-serif" }}>
			<h3>Reactive Map (each key = its own signal)</h3>

			<div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
				<input ref={inputKey} placeholder="key" />
				<input ref={inputVal} placeholder="value (number)" />

				<button
					onClick={() => {
						const k = inputKey.value.trim();
						const v = Number(inputVal.value);
						if (!k || Number.isNaN(v)) return;
						reactive.set(k, v);
						inputKey.value = "";
						inputVal.value = "";
					}}
				>
					add / set
				</button>

				<button onClick={() => reactive.clear()}>clear</button>
			</div>

			<div style={{ display: "grid", gap: "8px" }}>
				<For each={reactive.keys()} fallback={<div>empty</div>}>
					{(k) => (
						<KeyRow
							k={k}
							pair={reactive.getPair(k)!}
							onDelete={reactive.deleteKey}
						/>
					)}
				</For>
			</div>

			<div style={{ "margin-top": "12px" }}>
				<strong>Total: {total()}</strong>
			</div>
		</div>
	);
};

function KeyRow<T>(props: {
	k: string;
	pair: SignalPair<T>;
	onDelete: (k: string) => void;
	renderValue?: (v: T) => JSX.Element;
}) {
	const [getter, setter] = props.pair;

	// Эффект для демонстрации точечной реактивности
	createEffect(() => {
		console.log(`KeyRow render: ${props.k}`, getter());
	});

	return (
		<div
			style={{
				display: "flex",
				gap: "8px",
				"align-items": "center",
				padding: "6px",
				border: "1px solid #e5e7eb",
				"border-radius": "6px",
			}}
		>
			<strong>{props.k}</strong>

			<div style={{ "min-width": "60px" }}>
				{props.renderValue
					? props.renderValue(getter())
					: String(getter())}
			</div>

			<button
				onClick={() =>
					setter((p: any) => (typeof p === "number" ? p + 1 : p))
				}
			>
				+1
			</button>
			<button
				onClick={() =>
					setter((p: any) => (typeof p === "number" ? p - 1 : p))
				}
			>
				-1
			</button>
			<button onClick={() => props.onDelete(props.k)}>delete</button>
		</div>
	);
}
