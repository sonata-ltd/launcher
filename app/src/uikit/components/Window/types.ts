import { Component, JSX } from "solid-js";
import { ButtonProps, ButtonTypes } from "../Button/button";

export interface ButtonConfig {
	content:
		| string
		| number
		| JSX.Element
		| ((props?: {
				type?: ButtonTypes;
				onClick?: () => void;
		  }) => JSX.Element);
	action?: () => void;
	type?: ButtonTypes;
	last?: boolean;
}

export interface WindowFrameProps {
	/** Window title */
	name?: string;

	/** Force window to use max-width in pixels */
	width?: number;

	/** Main content */
	children?: JSX.Element;

	/** Sidebar content */
	sidebarChildren?: JSX.Element;

	/** Footer buttons config */
	controlsConfig?: ButtonConfig[] | ButtonConfig;

	/** Custom CSS class */
	class?: string;

	/** Called when close button clicked */
	onClose?: () => void;

	/** Called when minimize button clicked */
	onMinimize?: () => void;
}
