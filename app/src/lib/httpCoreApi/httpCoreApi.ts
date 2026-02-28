import { z } from "zod";
import { apiUrl } from "./constants";
import { ManifestDBID } from "lib/dbInterface/handler";
import { InstanceOptionPage } from "windows/InstanceOptions/instanceOptionsWindow";
import { createHttpClient, type KeyMatcher } from "./core/httpClient";

type Store = {
	getVersionsManifest: <T = unknown>(
		type: ManifestDBID,
		control?: RequestControl,
	) => Promise<T>;
	getInstanceOptionsData: <T = unknown>(
		id: number,
		page: InstanceOptionPage,
		control?: RequestControl,
	) => Promise<T>;
	changeInstanceOptionsData: (
		id: number,
		page: InstanceOptionPage,
		options: unknown,
		control?: AbortControl,
	) => Promise<void>;
	inspectJavaRuntime: <T = unknown>(
		path: string,
		control?: InspectJavaRuntimeControl,
	) => Promise<T>;
	addJavaRuntime: <T = unknown>(runtimeData: string) => Promise<void>;
	invalidateCache: (matcher?: KeyMatcher) => void;
	abortRequest: (key: string) => void;
};

type RequestControl = {
	signal?: AbortSignal;
	forceRefresh?: boolean;
};

type AbortControl = {
	signal?: AbortSignal;
};

type InspectJavaRuntimeControl = {
	signal?: AbortSignal;
	cancelPrevious?: boolean;
};

const MANIFEST_CACHE_TTL_MS = 5 * 60 * 1000;
const INSTANCE_OPTIONS_CACHE_TTL_MS = 30 * 1000;
const INSPECT_JAVA_RUNTIME_KEY = "inspect-java-runtime";

const getManifestKey = (id: ManifestDBID): string => `manifest:${id}`;
const getInstanceOptionsKey = (id: number, page: InstanceOptionPage): string =>
	`instance-options:${id}:${page}`;

const client = createHttpClient({
	baseUrl: apiUrl.host,
	cacheTtlMs: 60_000,
	retry: {
		retries: 2,
		baseDelayMs: 250,
		maxDelayMs: 2_000,
	},
});

export const fetchJsonHelper = async <T = unknown>(
	url: string,
	options?: RequestInit,
): Promise<T> => {
	const res = await fetch(url, options);

	if (!res.ok) {
		const text = await res.text().catch(() => "<no body>");
		throw new Error(`HTTP Error ${res.status}: ${text}`);
	}

	const text = await res.text();
	return text ? (JSON.parse(text) as T) : (undefined as T);
};

const store: Store = {
	getVersionsManifest: async <T = unknown>(
		type: ManifestDBID,
		control?: RequestControl,
	): Promise<T> => {
		const requestKey = getManifestKey(type);
		const cacheMode = control?.forceRefresh ? "refresh" : "default";

		if (type !== ManifestDBID.unifiedVersionManifest) {
			return client.request<T, { manifest_type: ManifestDBID }>({
				path: apiUrl.endpoints.getVersionsManifest,
				method: "POST",
				body: {
					manifest_type: type,
				},
				requestKey,
				cache: {
					key: requestKey,
					mode: cacheMode,
					ttlMs: MANIFEST_CACHE_TTL_MS,
				},
				dedupe: true,
				signal: control?.signal,
			});
		}

		return client.request<T>({
			path: apiUrl.endpoints.getVersionsUnified,
			method: "GET",
			requestKey,
			cache: {
				key: requestKey,
				mode: cacheMode,
				ttlMs: MANIFEST_CACHE_TTL_MS,
			},
			dedupe: true,
			signal: control?.signal,
		});
	},

	getInstanceOptionsData: async <T = unknown>(
		id: number,
		page: InstanceOptionPage,
		control?: RequestControl,
	): Promise<T> => {
		const requestKey = getInstanceOptionsKey(id, page);
		const cacheMode = control?.forceRefresh ? "refresh" : "default";

		return client.request<T>({
			path: `/instance/${id}/${page}`,
			method: "GET",
			requestKey,
			cache: {
				key: requestKey,
				mode: cacheMode,
				ttlMs: INSTANCE_OPTIONS_CACHE_TTL_MS,
			},
			dedupe: true,
			signal: control?.signal,
		});
	},

	changeInstanceOptionsData: async (
		id: number,
		page: InstanceOptionPage,
		options: unknown,
		control?: AbortControl,
	): Promise<void> => {
		const body = {
			id,
			page,
			options,
		};

		await client.request<void, typeof body>({
			path: apiUrl.endpoints.changeInstanceOptionsPage,
			method: "POST",
			body,
			responseType: "void",
			retry: false,
			signal: control?.signal,
			requestKey: `change-instance-options:${id}:${page}`,
			cache: {
				mode: "no-store",
			},
		});

		client.invalidate((cacheKey) =>
			cacheKey.startsWith(`instance-options:${id}:`),
		);
	},

	inspectJavaRuntime: async <T = unknown>(
		path: string,
		control?: InspectJavaRuntimeControl,
	): Promise<T> => {
		return client.request<T, string>({
			path: apiUrl.endpoints.inpectJavaRunime,
			method: "POST",
			body: path,
			headers: {
				"Content-Type": "text/plain",
			},
			serializeBody: (value) => value,
			retry: false,
			cache: {
				mode: "no-store",
			},
			dedupe: false,
			requestKey: INSPECT_JAVA_RUNTIME_KEY,
			cancelPrevious: control?.cancelPrevious ?? true,
			signal: control?.signal,
		});
	},

	addJavaRuntime: async <T = unknown>(runtimeData: string): Promise<T> => {
		return client.request<T, string>({
			path: apiUrl.endpoints.addJavaRuntime,
			method: "GET",
			body: runtimeData,
		});
	},

	invalidateCache: (matcher?: KeyMatcher) => {
		client.invalidate(matcher);
	},

	abortRequest: (key: string) => {
		client.abortRequest(key);
	},
};

export const httpCoreApi = (): Store => store;

export const validateMessageType = <T extends z.ZodTypeAny>(
	schema: T,
	rawMsg: unknown,
): z.infer<T> | false => {
	try {
		return schema.parse(rawMsg) as z.infer<T>;
	} catch (_err) {
		return false;
	}
};
