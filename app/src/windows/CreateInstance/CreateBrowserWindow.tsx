import { WindowComponentProps } from "lib/windowManager/types";
import { Component, createEffect, createSignal, For } from "solid-js";
import { CreateInstanceProps, CreateInstanceResult, CreateStep } from "./types";
import { useTranslatedMessages } from "lib/localization/useMessages";
import { createStore } from "solid-js/store";
import {
	ContentStack,
	FlexBox,
	VerticalStack,
	WindowFrame,
} from "uikit/components/Window";
import Button, { ButtonTypes } from "uikit/components/Button/button";
import Card from "uikit/components/Card";
import { Input } from "uikit/components/Input";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { ProgressDisplay } from "uikit/widgets/ProgressDisplay/progressDisplay";
import { useWebSocket } from "lib/wsManagment/manager";
import { useInstancesState } from "lib/instancesManagment";
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { openWindow } from "lib/windowManager/store";
import { ImageBrowserWindow } from "windows/ImageBrowser/ImageBrowserWindow";
import { ImageBrowserResult } from "windows/ImageBrowser/types";

interface FormStore {
	name: string;
	version: string;
	tags: string;
}

export const CreateInstanceWindow: Component<
	WindowComponentProps<CreateInstanceProps, CreateInstanceResult>
> = (props) => {
	const { get } = useTranslatedMessages();
	const ws = useWebSocket("initInstance");
	const [{ getVersionUrl }] = useInstancesState();

	const [step, setStep] = createSignal<CreateStep>(CreateStep.Form);
	let prevStep: number | undefined = undefined;
	const [imageSrc, setImageSrc] = createSignal<string | null>(null);

	const [form, setForm] = createStore<FormStore>({
		name: "",
		version: "",
		tags: "",
	});

	const [wsMessage, setWsMessage] = createSignal<any[]>([]);
	const [wsState, setWsState] = createSignal<string>("idle");

	createEffect(() => {
		const currentStep = step();
		if (currentStep === CreateStep.Progress) {
			props.updateMeta({
				title: `${get("creating") ?? "Creating"}: ${
					(form.name || get("instance")) ?? "Instance"
				}`,
			});
		}
	});

	const handleSelectImage = async () => {
		// const result = await props.openWindow();
		// if (result?.selectedImage) {
		// }
	};

	const handleVersionChange = (version: string) => {
		setForm("version", version);

		if (!form.name) {
			setForm("name", version);
		}
	};

	const validateForm = (): boolean => {
		if (!form.name.trim()) return false;
		if (!form.tags.trim()) return false;
		if (!form.version.trim()) return false;

		return true;
	};

	const handleCreate = async () => {
		if (!form.version) return;

		prevStep = step();
		setStep(CreateStep.Progress);

		if (!validateForm) return;

		const versionUrl = getVersionUrl(form.version);
		if (!versionUrl) return;

		const sendObject = JSON.stringify({
			name: form.name,
			url: versionUrl,
			request_id: uuidv4(),
		});

		ws.sendMessage(sendObject);
	};

	const handleCancel = () => {
		props.close({ created: false });
	};

	const handleBack = () => {
		// if (step() === CreateStep.Progress) {
		// 	return;
		// }

		prevStep = step();
		setStep((prev) => prev--);
	};

	const getControls = () => {
		switch (step()) {
			case CreateStep.Form:
				return [
					{
						label: get("cancel"),
						action: handleCancel,
						type: ButtonTypes.secondary,
					},
					{
						label: get("create"),
						action: handleCreate,
						type: ButtonTypes.primary,
					},
				];
			case CreateStep.Progress:
				return [
					{
						label: get("cancel"),
						action: handleCancel,
						type: ButtonTypes.secondary,
					},
				];
			default:
				return [];
		}
	};

	const useImageBrowserWindow = async () => {
		const result = await openWindow<null, ImageBrowserResult>(
			ImageBrowserWindow,
			null,
			{},
		);

		if (result?.imageSrc) {
			setImageSrc(result.imageSrc);
		}
	};

	return (
		<WindowFrame
			name={get("create_instance") ?? "Create Instance"}
			width={500}
			onClose={handleCancel}
			onMinimize={props.minimize}
			controlsConfig={getControls()}
		>
			<ContentStack index={step} prevIndex={prevStep}>
				{/* Step 0: Form */}
				<VerticalStack>
					<FlexBox>
						<Card size="135px" img={imageSrc()}>
							<Button secondary onClick={useImageBrowserWindow}>
								{get("change") ?? "Change"}
							</Button>
						</Card>
						<VerticalStack expand>
							<Input
								label={get("name")}
								placeholder={get("instance_name")}
								value={form.name}
								onInput={(e) =>
									setForm("name", e.currentTarget.value)
								}
							/>
							<Input
								label={get("tags")}
								placeholder={get("instance_tags")}
								value={form.tags}
								onInput={(e) =>
									setForm("tags", e.currentTarget.value)
								}
							/>
						</VerticalStack>
					</FlexBox>
					<VerticalStack>
						<Dropdown
							value={form.version}
							onChange={handleVersionChange}
							label={get("versions")}
							placeholder={get("instance_version")}
							typeable
						>
							<For each={[...props.data.versions.keys()]}>
								{(version) => (
									<Dropdown.Item
										value={version}
										searchValue={version}
									>
										{version}
									</Dropdown.Item>
								)}
							</For>
						</Dropdown>
					</VerticalStack>
				</VerticalStack>

				{/* Step 1: Progress */}
				<ProgressDisplay
					wsMsgs={ws.messages}
					getMessagesTracked={ws.getMessagesTracked}
					getWSState={ws.state}
				/>

				{/* Step 2: Complete */}
				<div>
					<h2>{get("instance_created") ?? "Instance Created!"}</h2>
					<p>{form.name || form.version}</p>
				</div>
			</ContentStack>
		</WindowFrame>
	);
};
