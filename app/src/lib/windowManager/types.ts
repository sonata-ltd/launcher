import { Accessor, Component, Owner, Setter } from "solid-js";
import {
	WINDOW_ANIMATIONS,
	WINDOW_ANIMATIONS_TYPE,
} from "uikit/components/Window";

export const ANIMATIONS = WINDOW_ANIMATIONS;
export const ANIMATIONS_TYPE = WINDOW_ANIMATIONS_TYPE;

export type WindowId = string;

export type WindowVisualState =
	| "open"
	| "closing"
	| "minimizing"
	| "minimized"
	| "restoring";

// Stores reactive values that can be used inside component
export interface WindowMeta {
	title: string;
}

export interface WindowProperties {
	state: Accessor<WindowVisualState>;
	setState: Setter<WindowVisualState>;
	meta: Accessor<WindowMeta>;
	setMeta: Setter<WindowMeta>;
}

// Stores non-reactive values that can be used inside component
export interface WindowOptions {
	width?: number;
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
	minimizable?: boolean;
}

export interface WindowComponentProps<Props = unknown, Result = unknown> {
	data: Props;
	close: (result?: Result) => void;
	minimize: () => void;
	openWindow: typeof import("./store").openWindow;
	updateMeta: (meta: Partial<WindowMeta>) => void;
}

export interface WindowEntry {
	readonly id: WindowId;
	readonly component: Component<WindowComponentProps<any, any>>;
	readonly props: unknown;
	readonly options: WindowOptions;

	properties: WindowProperties;

	// Each window must have a *head* mount for proper minimization and restoration
	owner?: Owner;
	head?: HTMLDivElement;
	dispose?: () => void;
	closeResult?: unknown;
}
