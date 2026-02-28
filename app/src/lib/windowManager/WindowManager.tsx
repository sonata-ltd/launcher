import {
	Component,
	createEffect,
	createSignal,
	For,
	getOwner,
	on,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import {
	closeTopWindow,
	closeWindow,
	finalizeClose,
	finalizeMinimize,
	finalizeRestore,
	focusWindow,
	getWindow,
	minimizeWindow,
	openWindow,
	setWindowRootOwner,
	updateWindowMeta,
	useHasAppearedWindows,
	useHasOpenWindows,
	useOpenCount,
	useOpenWindowIds,
	useTopWindowId,
} from "./store";
import { Portal } from "solid-js/web";
import { ANIMATIONS, WindowComponentProps, WindowId } from "./types";
import { animate, spring } from "motion";
import { WINDOW_ANIMATIONS_TYPE } from "uikit/components/Window";
import { animationValues as av } from "uikit/components/definitions";
import css from "./WindowManager.module.less";
import { runSpringHardcodedMinimize } from "./animate";

const BASE_Z_INDEX = 1000;
const Z_INDEX_STEP = 10;

export const WindowManager: Component = () => {
	const owner = getOwner();
	if (owner) setWindowRootOwner(owner);

	const openIds = useOpenWindowIds();
	const hasOpen = useHasOpenWindows();
	const topId = useTopWindowId();
	const openCount = useOpenCount();
	const hasAppearedWindows = useHasAppearedWindows();

	let backdropRef: HTMLDivElement | undefined = undefined;

	createEffect(
		on(hasAppearedWindows, (value) => {
			if (!backdropRef) return;

			// All winows are closed now
			if (value === false) {
				animate(
					backdropRef,
					av.elementsPoints.windowBackdrop.close,
					av.defaultAnimationType,
				).then(() => {
					(backdropRef as HTMLDivElement).style.display = "none";
				});
			}

			// The first window will be open now
			if (value === true) {
				(backdropRef as HTMLDivElement).style.display = "block";
				animate(
					backdropRef,
					av.elementsPoints.windowBackdrop.open,
					av.defaultAnimationType,
				);
			}
		}),
	);

	createEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeTopWindow();
			window.addEventListener("keydown", onKeyDown);
			onCleanup(() => window.removeEventListener("keydown", onKeyDown));
		};
	});

	const handleBackdropClick = () => {
		const id = topId();
		if (!id) return;

		const entry = getWindow(id);
		if (entry?.options.closeOnBackdrop) {
			closeWindow(id);
		}
	};

	return (
		<Portal mount={document.getElementById("window-root") ?? document.body}>
			<div
				ref={backdropRef}
				class={css.backdrop}
				style={{ opacity: 0, display: "none" }}
				onClick={handleBackdropClick}
			></div>
			<Show when={hasOpen()}>
				<div class={css.windows}>
					<For each={openIds()}>
						{(id, i) => (
							<WindowRenderer
								id={id}
								zIndex={BASE_Z_INDEX + i() + Z_INDEX_STEP}
							/>
						)}
					</For>
				</div>
			</Show>
		</Portal>
	);
};

interface WindowRendererProps {
	id: WindowId;
	zIndex: number;
}

const WindowRenderer: Component<WindowRendererProps> = (props) => {
	const entry = getWindow(props.id);
	if (!entry) return null;

	let containerRef: HTMLDivElement | undefined;
	// let closeResult: unknown | undefined = undefined;

	const runAnimation = (
		type: keyof typeof ANIMATIONS,
		onComplete?: () => void,
	) => {
		if (!containerRef) {
			onComplete?.();
			return;
		}

		const points = ANIMATIONS[type];
		animate(containerRef, points, {
			type: spring,
			bounce: 0,
			duration: 0.4,
		}).then(() => {
			onComplete?.();
		});
	};

	onMount(() => {
		if (entry.head && containerRef) {
			while (entry.head.firstChild) {
				containerRef.appendChild(entry.head.firstChild);
			}
		}

		const state = entry.properties.state();

		if (state === "open") {
			if (containerRef) {
				containerRef.style.opacity = "0";
			}

			runAnimation("open");
		} else if (state === "restoring") {
			if (containerRef) {
				containerRef.style.opacity = "0";
			}

			runAnimation("restore", () => {
				finalizeRestore(props.id);
			});
		}
	});

	onCleanup(() => {
		if (!entry.head || !containerRef) return;
		while (containerRef.firstChild) {
			entry.head.appendChild(containerRef.firstChild);
		}
	});

	createEffect(() => {
		const state = entry.properties.state();

		if (state === "closing") {
			runAnimation("close", () => {
				finalizeClose(props.id, entry.closeResult);
			});
		} else if (state === "minimizing") {
			runAnimation("minimize", () => {
				finalizeMinimize(props.id);
			});
		}
	});

	return (
		<div
			ref={containerRef}
			class={css["window-container"]}
			style={{
				"z-index": props.zIndex,
			}}
			onClick={(e) => {
				e.stopPropagation();
				focusWindow(props.id);
			}}
		></div>
	);
};
