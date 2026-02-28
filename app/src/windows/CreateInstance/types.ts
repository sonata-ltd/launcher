export interface CreateInstanceProps {
	versions: Map<string, string>;
}

export interface CreateInstanceResult {
	created: boolean;
	instanceId?: number;
	name?: string;
	version?: string;
}

// export type CreateStep = "form" | "progress" | "complete";
export enum CreateStep {
	Form = 0,
	Progress = 1,
	Complete = 2,
}

export interface InstanceFormData {
	name: string | undefined;
	version: string | undefined;
	loader: string | undefined;
	imageSrc: string | undefined;
	tags: string;
}
