import { Component, For } from "solid-js";
import Card from "uikit/components/Card";

import { useInstancesState } from "lib/instancesManagment";
import Button from "uikit/components/Button";
import css from "./instances.module.less";
import { useTranslatedMessages } from "lib/localization/useMessages";
import { openWindow } from "lib/windowManager/store";
import { CreateInstanceResult } from "windows/CreateInstance/types";
import { CreateInstanceWindow } from "windows/CreateInstance/CreateBrowserWindow";
import {
	InstanceOptionsProps,
	InstanceOptionsWindow,
} from "windows/InstanceOptions/instanceOptionsWindow";

const Page: Component = () => {
	const { get } = useTranslatedMessages();
	const [{ getInstances, runInstance, getManifestVersionsMap }] =
		useInstancesState();

	const useCreateWindow = async () => {
		const result = await openWindow<
			{ versions: Map<string, string> },
			CreateInstanceResult
		>(CreateInstanceWindow, { versions: getManifestVersionsMap() }, {});

		if (result?.created) {
			console.log("Instance created");
		}
	};

	const useInstanceOptionsWindow = async (id: number) => {
		await openWindow<InstanceOptionsProps, null>(
			InstanceOptionsWindow,
			{
				id,
			},
			{},
		);
	};

	return (
		<>
			<div class={css.InstancesWrapper}>
				<div class={css.PageContent}>
					<Button secondary onClick={() => useCreateWindow()}>
						{get("create")}
					</Button>
					<div class={css.InstancesContainer}>
						<For each={getInstances()}>
							{(instance, i) => (
								<Card
									name={instance.name}
									description={`${instance.loader} ${instance.version}`}
								>
									<Button
										class={css["button"]}
										onClick={() => runInstance(instance)}
										secondary
									>
										Play
									</Button>
									<Button
										class={css["button"]}
										onClick={() =>
											useInstanceOptionsWindow(
												instance.id,
											)
										}
										secondary
									>
										Options
									</Button>
								</Card>
							)}
						</For>
					</div>
				</div>
			</div>
		</>
	);
};

export default Page;
