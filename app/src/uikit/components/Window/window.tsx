import {
	Accessor,
	children,
	Component,
	createEffect,
	createMemo,
	createSignal,
	For,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { animate, spring } from "motion";
import { animationValues as av } from "../definitions";

import css from "./window.module.less";
import Button from "../Button";
import { ButtonTypes } from "../Button/button";
import { useLogger } from "lib/logger";
import { Portal } from "solid-js/web";
import { Separator } from "../Separator/separator";
import { ButtonConfig, WindowFrameProps } from "./types";

// export type ButtonConfig = {
// 	label: string;
// 	action: () => void;
// 	type?: ButtonTypes;
// };

// type WindowProps = {
// 	visible: Accessor<boolean>;
// 	setVisible: Setter<boolean>;
// 	controlsConfig?: Accessor<ButtonConfig[]>;
// 	name?: string | Accessor<string>;
// 	width?: number;
// 	children?: JSX.Element;
// 	detached?: boolean;
// 	sidebarChildren?: JSX.Element | JSX.Element[];
// 	headerButton?: JSX.Element;
// 	class?: string;
// };

// export const Window: Component<WindowProps> = (props) => {
// 	let localDetached = props.detached;
// 	let windowContentWrapper: HTMLDivElement | undefined = undefined;
// 	let windowHolder = document.getElementById("window-holder");

// 	createEffect(() => {
// 		if (windowContentWrapper && windowHolder) {
// 			const el = windowContentWrapper as HTMLDivElement;
// 			el.setAttribute("data-window-enabled", props.visible().toString());
// 			el.id = "window-wrapper_" + crypto.randomUUID();
// 		}
// 	});

// 	onMount(() => {
// 		if (!windowHolder) {
// 			localDetached = false;
// 			console.warn("Window Holder not found");
// 		}
// 	});

// 	return (
// 		<>
// 			{localDetached && windowHolder ? (
// 				<Portal mount={windowHolder} ref={windowContentWrapper}>
// 					<WindowBase {...props} />
// 				</Portal>
// 			) : (
// 				<WindowBase {...props} />
// 			)}
// 		</>
// 	);
// };

export const WindowFrame: Component<WindowFrameProps> = (props) => {
	const resolvedChildrens = children(() => props.children);
	const resolvedSidebarChildrens = children(() => props.sidebarChildren);
	const hasSidebar = () => !!resolvedSidebarChildrens();

	return (
		<>
			<div
				class={css["window"]}
				classList={{
					[props.class!]: !!props.class,
				}}
				style={`${
					props.width ? `max-width: ${props.width}px` : undefined
				}`}
			>
				{/* Header - outside sidebar layout */}
				<Show when={!hasSidebar()}>
					<WindowHeader
						name={props.name}
						onMinimize={props.onMinimize}
						onClose={props.onClose}
					/>
				</Show>

				{/* Main layout */}
				<div
					classList={{
						[css["horizontal-container"]]: hasSidebar(),
					}}
				>
					{/* Sidebar */}
					<Show when={hasSidebar()}>
						<>
							{resolvedSidebarChildrens()}
							<Separator vertical />
						</>
					</Show>

					{/* Content wrapper */}
					<div class={css["wrapper"]}>
						{/* Header - inside sidebar layout */}
						<Show when={hasSidebar()}>
							<WindowHeader
								name={props.name}
								onMinimize={props.onMinimize}
								onClose={props.onClose}
							/>
						</Show>

						{/* Main content */}
						<div class={css["main-container"]}>
							<Show
								when={resolvedChildrens()}
								fallback={
									<div class={css["empty-message"]}>
										<p>Empty content...</p>
									</div>
								}
							>
								{resolvedChildrens()}
							</Show>
						</div>

						{/* Footer controls - inside sidebar layout */}
						<Show when={props.controlsConfig && hasSidebar()}>
							<div class={css["bottom-container"]}>
								<AttachedWindowControls
									controlsConfig={props.controlsConfig!}
								/>
							</div>
						</Show>
					</div>
				</div>

				{/* Footer controls - outside sidebar layout */}
				<Show when={props.controlsConfig && !hasSidebar()}>
					<AttachedWindowControls
						controlsConfig={props.controlsConfig!}
					/>
				</Show>
			</div>
		</>
	);
};

interface WindowHeaderProps {
	name?: string;
	onClose?: () => void;
	onMinimize?: () => void;
}

const WindowHeader: Component<WindowHeaderProps> = (props) => {
	return (
		<>
			<div class={css["header"]}>
				<div class={css["name"]}>
					<p>{props.name || "Window"}</p>
				</div>
				<div class={css["controls-container"]}>
					<Show when={props.onMinimize}>
						<div
							class={css["minimize"]}
							onClick={props.onMinimize}
						></div>
					</Show>
					<Show when={props.onClose}>
						<div class={css["close"]} onClick={props.onClose}></div>
					</Show>
				</div>
			</div>
		</>
	);
};

interface AttachedWindowControlsProps {
	controlsConfig: ButtonConfig | ButtonConfig[];
}

const AttachedWindowControls: Component<AttachedWindowControlsProps> = (
	props,
) => {
	const controlsConfig = (): ButtonConfig[] => {
		return Array.isArray(props.controlsConfig)
			? props.controlsConfig
			: [props.controlsConfig];
	};

	const isPrimitive = (v: unknown): v is string | number =>
		typeof v === "string" || typeof v === "number";

	const isVNode = (v: unknown): v is JSX.Element =>
		typeof v === "object" && v !== null && ("type" in v || "props" in v);

	const isButtonVNode = (v: unknown): boolean => {
		return isVNode(v) && (v as any).type === Button;
	};

	const buildConfigButton = (cfg: ButtonConfig) => {
		const content = cfg.content;

		if (typeof content === "function") {
			const built = (content as any)({
				type: cfg.type,
				onClick: cfg.action,
			});
			return built;
		}

		if (isButtonVNode(content)) {
			return content as JSX.Element;
		}

		if (isPrimitive(content)) {
			return (
				<Button type={cfg.type} onClick={cfg.action}>
					<span>{content}</span>
				</Button>
			);
		} else {
			return content as JSX.Element;
		}
	};

	return (
		<div class={css["window-controls"]}>
			<For each={controlsConfig()}>
				{(button) => {
					const el = buildConfigButton(button);

					if (button.last) {
						return <div style={{ width: "100%" }}>{el}</div>;
					}

					return el;
				}}
			</For>
		</div>
	);
};

export interface WindowControlsProps {
	children: JSX.Element;
}

export const WindowControls: Component<WindowControlsProps> = (props) => {
	return <div class={css["window-controls"]}>{props.children}</div>;
};

type ContentWrapperProps = {
	children: JSX.Element;
	alignTop?: boolean;
};

export const ContentWrapper = (props: ContentWrapperProps) => {
	return (
		<>
			<div
				class={css["window-content"]}
				classList={{
					[css["align-top"]]: props.alignTop,
				}}
			>
				<div class={css["content"]}>{props.children}</div>
			</div>
		</>
	);
};
