import {
	createResource,
	onCleanup,
	type ResourceOptions,
	type ResourceReturn,
} from "solid-js";
import type { HttpClient, HttpRequestConfig } from "./httpClient";

type ResourceSourceValue<T> = T | null | undefined | false;

type HttpResourceReturn<TSource, TResponse> = [
	ResourceReturn<TResponse | undefined, ResourceSourceValue<TSource>>[0],
	ResourceReturn<TResponse | undefined, ResourceSourceValue<TSource>>[1] & {
		abort: () => void;
	},
];

export const createHttpResource = <TSource, TResponse>(
	source: () => ResourceSourceValue<TSource>,
	buildRequest: (source: TSource) => HttpRequestConfig<TResponse>,
	client: HttpClient,
	options?: ResourceOptions<
		TResponse | undefined,
		ResourceSourceValue<TSource>
	>,
): HttpResourceReturn<TSource, TResponse> => {
	let activeController: AbortController | null = null;

	const [resource, actions] = createResource<
		TResponse | undefined,
		ResourceSourceValue<TSource>
	>(
		source,
		async (value) => {
			if (value === undefined || value === null || value === false) {
				return undefined;
			}

			activeController?.abort(
				new DOMException("Resource request superseded", "AbortError"),
			);
			const controller = new AbortController();
			activeController = controller;

			try {
				return await client.request({
					...buildRequest(value),
					signal: controller.signal,
				});
			} finally {
				if (activeController === controller) {
					activeController = null;
				}
			}
		},
		options,
	);

	const abort = () => {
		activeController?.abort(
			new DOMException("Resource request aborted", "AbortError"),
		);
	};

	onCleanup(abort);

	return [resource, { ...actions, abort }];
};
