import { useTranslatedMessages } from "lib/localization/useMessages";
import { WindowComponentProps } from "lib/windowManager/types";
import { Component, createSignal, onCleanup, Show } from "solid-js";
import Button, { ButtonTypes } from "uikit/components/Button/button";
import { Input } from "uikit/components/Input";
import {
	ButtonConfig,
	ContentStack,
	VerticalStack,
	WindowFrame,
} from "uikit/components/Window";
import css from "./manualAdditionWindow.module.less";
import { Spinner } from "uikit/components/Spinner/spinner";
import { httpCoreApi, isAbortError } from "lib/httpCoreApi";

export enum ContentStackStep {
	DefinePath = 0,
	Validate = 1,
}

type DetectedJavaRuntime = {
	version: string | null;
	exec_path: string;
	home_path: string | null;
	vendor: string | null;
};

type JavaRuntime = {
	id: number;
	version: string;
	exec_path: string;
	home_path: string;
	vendor: string;
};

interface ManualAdditionResult {
	addedJava: JavaRuntime;
}

export const ManualAdditionWindow: Component<
	WindowComponentProps<null, ManualAdditionResult>
> = (props) => {
	const { get } = useTranslatedMessages();
	const api = httpCoreApi();

	const [step, setStep] = createSignal<ContentStackStep>(
		ContentStackStep.DefinePath,
	);
	let prevStep: ContentStackStep | undefined = undefined;

	const [path, setPath] = createSignal("");
	const [pathError, setPathError] = createSignal<string | undefined>(
		undefined,
	);

	const [detectedRuntime, setDetectedRuntime] =
		createSignal<DetectedJavaRuntime | null>(null);
	const [inspectError, setInspectError] = createSignal<string | undefined>(
		undefined,
	);

	const [allowApply, setAllowApply] = createSignal(false);

	const [inspecting, setInspecting] = createSignal(false);
	let activeProbeController: AbortController | null = null;

	const abortInspectRequest = () => {
		activeProbeController?.abort();
		activeProbeController = null;
	};

	const handleBack = () => {
		abortInspectRequest();
		setInspecting(false);
		setStep(ContentStackStep.DefinePath);
	};

	const getControls = (): ButtonConfig[] => {
		switch (step()) {
			case ContentStackStep.DefinePath:
				return [
					{
						content: get("cancel"),
						action: handleCancel,
						type: ButtonTypes.secondary,
					},
					{
						content: (
							<Button
								onClick={handleValidate}
								disabled={
									inspecting() || path().trim().length === 0
								}
								type={ButtonTypes.primary}
							>
								<span>Probe</span>
							</Button>
						),
					},
				];
			case ContentStackStep.Validate:
				return [
					{
						content: get("back"),
						action: handleBack,
						type: ButtonTypes.tertiary,
						last: true,
					},
					{
						content: get("cancel"),
						action: handleCancel,
						type: ButtonTypes.secondary,
					},
					{
						content: (
							<Show
								when={inspecting()}
								fallback={
									<Button primary>
										<span>Apply</span>
									</Button>
								}
							>
								<Button primary icon disabled>
									<Spinner
										size={17}
										spinnerColor="rgba(102, 106, 110, 0.7)"
									/>
									<span>Inspecting...</span>
								</Button>
							</Show>
						),
					},
				];
			default:
				return [];
		}
	};

	const handleCancel = () => {
		abortInspectRequest();
		props.close();
	};

	const handleValidate = async () => {
		if (inspecting()) return;
		const runtimePath = path().trim();
		if (!runtimePath) {
			setPathError("Path is required");
			return;
		}

		setStep(ContentStackStep.Validate);
		setInspecting(true);
		setPathError(undefined);
		setInspectError(undefined);
		setDetectedRuntime(null);

		const requestController = new AbortController();
		activeProbeController = requestController;

		try {
			const data = await api.inspectJavaRuntime<DetectedJavaRuntime>(
				runtimePath,
				{
					signal: requestController.signal,
					cancelPrevious: true,
				},
			);
			if (activeProbeController !== requestController) return;

			setDetectedRuntime(data);
		} catch (error) {
			if (isAbortError(error)) return;
			setInspectError(
				error instanceof Error
					? error.message
					: "Failed to inspect runtime",
			);
		} finally {
			if (activeProbeController === requestController) {
				activeProbeController = null;
			}
			setInspecting(false);
		}
	};

	onCleanup(() => {
		abortInspectRequest();
	});

	return (
		<WindowFrame
			width={418}
			name={get("add_external_runtime")}
			onClose={props.close}
			controlsConfig={getControls()}
		>
			<ContentStack index={step} prevIndex={prevStep}>
				<VerticalStack>
					<Input
						label="Path to Binary"
						hint="Path to runtime executable file"
						value={path()}
						error={pathError()}
						onInput={(e) => {
							const input = e.currentTarget as HTMLInputElement;
							setPath(input.value);
							if (pathError()) {
								setPathError(undefined);
							}
						}}
						expand
					/>
				</VerticalStack>
				<VerticalStack>
					<div class={css["top-label"]}>
						<Show
							when={!inspectError()}
							fallback={<p>{inspectError()}</p>}
						>
							<p>Detected Properties</p>
							<p>
								Please verify the automatically detected Java
								runtime properties.
							</p>
						</Show>
					</div>
					<Input
						label="Runtime Version"
						value={detectedRuntime()?.version ?? "Not detected"}
						readOnly
						expand
					/>
					<Input
						label="Vendor"
						value={detectedRuntime()?.vendor ?? "Not detected"}
						readOnly
						expand
					/>
					<Input
						label="Java Home Path"
						value={detectedRuntime()?.home_path ?? "Not detected"}
						readOnly
						expand
					/>
				</VerticalStack>
			</ContentStack>
		</WindowFrame>
	);
};
