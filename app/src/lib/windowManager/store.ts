import { createStore, produce } from "solid-js/store";
import {
	WindowComponentProps,
	WindowEntry,
	WindowId,
	WindowMeta,
	WindowOptions,
	WindowProperties,
	WindowVisualState,
} from "./types";
import {
	Accessor,
	batch,
	Component,
	createMemo,
	createSignal,
	getOwner,
	Owner,
	runWithOwner,
} from "solid-js";
import { DoublyLinkedList } from "utils/linkedList";
import { render } from "solid-js/web";

let rootOwner: Owner | undefined = undefined;

// All windows by id
const windows = new Map<WindowId, WindowEntry>();

// Promise resolvers
const resolvers = new Map<WindowId, (result: unknown) => void>();

// The order of opened windows
// HEAD - bottom, TAIL - top
const openList = new DoublyLinkedList<WindowId>((id) => id);

// The order if minimized windows
// HEAD - first minimized, TAIL - last minimized
const minimizedList = new DoublyLinkedList<WindowId>((id) => id);

// Ticks for reactivity
const [openTick, setOpenTick] = createSignal(0);
const triggerOpenTick = () => setOpenTick((t) => t + 1);

const [minimizedTick, setMinimizedTick] = createSignal(0);
const triggerMinimizeTick = () => setMinimizedTick((t) => t + 1);

const [disapperaingTick, setDisappearingTick] = createSignal(0);
const triggerDisappearing = () => setDisappearingTick((t) => t + 1);

let idCounter = 0;
const generateId = (): WindowId => `av_window-${++idCounter}-${Date.now()}`;

function createWindowEntry<P, R>(
	id: WindowId,
	component: Component<WindowComponentProps<P, R>>,
	props: P,
	options: WindowOptions,
): WindowEntry {
	const [state, setState] = createSignal<WindowVisualState>("open");
	const [meta, setMeta] = createSignal<WindowMeta>({
		title: "Window",
	});

	const head = document.createElement("div");

	return {
		id,
		component,
		props,
		options: {
			width: options.width,
			closeOnBackdrop: options.closeOnBackdrop ?? true,
			closeOnEscape: options.closeOnEscape ?? true,
			minimizable: options.minimizable ?? true,
		},
		properties: {
			state,
			setState,
			meta,
			setMeta,
		},
		head,
	} as WindowEntry;
}

export function openWindow<Props, Result = void>(
	component: Component<WindowComponentProps<Props, Result>>,
	props: Props,
	options: WindowOptions = {},
): Promise<Result | undefined> {
	return new Promise((resolve) => {
		const id = generateId();
		const entry = createWindowEntry(id, component, props, options);

		windows.set(id, entry);
		resolvers.set(id, resolve as (result: unknown) => void);

		const windowProps: WindowComponentProps = {
			data: props,
			close: (result?: unknown) => {
				// save result on entry so WindowRenderer (which performs animation) can read it later
				const current = windows.get(id);
				if (current) current.closeResult = result;
				closeWindow(id, result);
			},
			minimize: () => minimizeWindow(id),
			openWindow,
			updateMeta: (meta) => updateWindowMeta(id, meta),
		};

		const ownerToUse = rootOwner ?? getOwner();
		if (!ownerToUse) {
			throw new Error(
				"openWindow must be called inside a reactive scope or you must register a root owner. " +
					"Call setWindowRootOwner(getOwner()) from a component (e.g. in WindowManager) that is mounted under your providers.",
			);
		}

		const head = entry.head;
		if (!head) {
			throw new Error("`head` in window entry is undefined");
		}

		entry.dispose = runWithOwner(ownerToUse, () =>
			render(() => component(windowProps as any), head),
		);

		openList.push(id);
		triggerOpenTick();
	});
}

export function closeWindow(id: WindowId, result?: unknown): void {
	const entry = windows.get(id);
	if (!entry) return;

	const currentState = entry.properties.state();

	if (currentState === "closing") return;

	// Resolve the promise immediately before starting the closing animation.
	// This allows the caller to receive the result without waiting for the UI transitions to finish.
	const resolver = resolvers.get(id);
	resolver?.(result);

	if (currentState === "minimized") {
		finalizeClose(id, result);
	} else {
		entry.properties.setState("closing");
		triggerDisappearing();
	}
}

export function finalizeClose(id: WindowId, result?: unknown): void {
	const entry = windows.get(id);
	if (!entry) return;

	const wasMinimized = minimizedList.has(id);

	try {
		entry.dispose?.();
	} catch (e) {
		console.error("Error disposing window root: ", e);
	}

	windows.delete(id);
	resolvers.delete(id);
	openList.remove(id);
	minimizedList.remove(id);

	if (wasMinimized) {
		triggerMinimizeTick();
	} else {
		triggerOpenTick();
	}
}

export function closeTopWindow(): void {
	const topId = openList.getLast();
	if (!topId) return;

	const entry = windows.get(topId);
	if (entry?.options.closeOnEscape) {
		closeWindow(topId);
	}
}

export function closeAllWindows(): void {
	const allResolvers = [...resolvers.values()];

	for (const entry of windows.values()) {
		try {
			entry.dispose?.();
		} catch (e) {
			console.error("Error disposing window root:", e);
		}
	}

	windows.clear();
	resolvers.clear();
	openList.clear();
	minimizedList.clear();

	batch(() => {
		triggerOpenTick();
		triggerMinimizeTick();
	});

	for (const resolver of allResolvers) {
		resolver(undefined);
	}
}

export function minimizeWindow(id: WindowId): void {
	const entry = windows.get(id);
	if (!entry) return;
	if (!entry.options.minimizable) return;

	const state = entry.properties.state;
	if (state() !== "open") return;

	entry.properties.setState("minimizing");
}

export function finalizeMinimize(id: WindowId): void {
	const entry = windows.get(id);
	if (!entry) return;

	openList.remove(id);
	minimizedList.push(id);

	batch(() => {
		entry.properties.setState("minimized");
		triggerOpenTick();
		triggerMinimizeTick();
	});
}

export function restoreWindow(id: WindowId): void {
	const entry = windows.get(id);
	if (!entry) return;
	if (entry.properties.state() !== "minimized") return;

	minimizedList.remove(id);
	openList.push(id);

	batch(() => {
		entry.properties.setState("restoring");
		triggerOpenTick();
		triggerMinimizeTick();
	});
}

export function finalizeRestore(id: WindowId): void {
	const entry = windows.get(id);
	if (!entry) return;

	entry.properties.setState("open");
}

export function focusWindow(id: WindowId): void {
	const entry = windows.get(id);
	if (!entry) return;
	if (entry.properties.state() !== "open") return;
	if (openList.getLast() === id) return;

	openList.moveToStart(id);
	triggerOpenTick();
}

export function updateWindowMeta(
	id: WindowId,
	updates: Partial<WindowMeta>,
): void {
	const entry = windows.get(id);
	if (!entry) return;

	entry.properties.setMeta((prev) => ({ ...prev, ...updates }));
}

export function getWindow(id: WindowId): WindowEntry | undefined {
	return windows.get(id);
}

export function hasWindow(id: WindowId): boolean {
	return windows.has(id);
}

export function useOpenWindowIds(): Accessor<WindowId[]> {
	return createMemo(() => {
		openTick();
		return openList.toArray();
	});
}

export function useMinimizedWindowsIds(): Accessor<WindowId[]> {
	return createMemo(() => {
		minimizedTick();
		return minimizedList.toArray();
	});
}

export function useTopWindowId(): Accessor<WindowId | undefined> {
	return createMemo(() => {
		openTick();
		return openList.getLast();
	});
}

export function useHasOpenWindows(): Accessor<boolean> {
	return createMemo(() => {
		openTick();

		return !openList.isEmpty;
	});
}

export function useOpenCount(): Accessor<number> {
	return createMemo(() => {
		openTick();
		return openList.size;
	});
}

export function useMinimizedCount(): Accessor<number> {
	return createMemo(() => {
		minimizedTick();
		return minimizedList.size;
	});
}

export function useHasAppearedWindows(): Accessor<boolean> {
	return createMemo(() => {
		openTick();
		disapperaingTick();

		if (openList.size === 1) {
			const windowId = openList.getFirst();
			if (!windowId) return false;

			const window = windows.get(windowId);
			if (!window) return false;

			const windowState = window.properties.state();

			// Window is closing right now
			if (windowState === "closing" || windowState === "minimizing") {
				return false;
			} else {
				// Window is visible
				return true;
			}
		} else if (openList.size > 1) {
			return true;
		}

		return false;
	});
}

export function setWindowRootOwner(o: Owner) {
	rootOwner = o;
}
