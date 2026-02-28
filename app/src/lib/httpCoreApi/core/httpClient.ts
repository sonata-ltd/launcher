import { z } from "zod";

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

export type HttpMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "HEAD"
	| "OPTIONS";

export type HttpResponseType =
	| "json"
	| "text"
	| "blob"
	| "arrayBuffer"
	| "void";

export type CacheMode = "no-store" | "default" | "refresh";
export type KeyMatcher = string | RegExp | ((key: string) => boolean);

type PreparedRequest = {
	method: HttpMethod;
	url: string;
	requestKey: string;
};

export class HttpError extends Error {
	readonly status: number;
	readonly statusText: string;
	readonly url: string;
	readonly body: string;

	constructor(params: {
		status: number;
		statusText: string;
		url: string;
		body: string;
	}) {
		super(`HTTP ${params.status} ${params.statusText} at ${params.url}`);
		this.name = "HttpError";
		this.status = params.status;
		this.statusText = params.statusText;
		this.url = params.url;
		this.body = params.body;
	}
}

type RetryContext = {
	attempt: number;
	error: unknown;
	request: PreparedRequest;
};

export type RetryPolicy = {
	retries: number;
	baseDelayMs: number;
	maxDelayMs: number;
	jitter: boolean;
	shouldRetry: (context: RetryContext) => boolean;
};

export type CachePolicy = {
	mode?: CacheMode;
	key?: string;
	ttlMs?: number;
};

export type RetryPolicyOverride =
	| (Partial<Omit<RetryPolicy, "shouldRetry">> & {
			shouldRetry?: RetryPolicy["shouldRetry"];
	  })
	| false;

export type HttpRequestConfig<TResponse, TBody = unknown> = {
	path: string;
	method?: HttpMethod;
	query?: Record<string, QueryValue>;
	headers?: HeadersInit;
	body?: TBody;
	serializeBody?: (body: TBody) => BodyInit | undefined;
	parseResponse?: (response: Response) => Promise<TResponse>;
	responseType?: HttpResponseType;
	schema?: z.ZodType<TResponse>;
	signal?: AbortSignal;
	requestKey?: string;
	cancelPrevious?: boolean;
	dedupe?: boolean;
	dedupeKey?: string;
	cache?: CachePolicy;
	retry?: RetryPolicyOverride;
	timeoutMs?: number;
	credentials?: RequestCredentials;
};

export type HttpClientConfig = {
	baseUrl: string;
	headers?: HeadersInit;
	cacheTtlMs?: number;
	retry?: Exclude<RetryPolicyOverride, false>;
};

type CacheEntry = {
	value: unknown;
	expiresAt: number;
};

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set<HttpMethod>([
	"GET",
	"HEAD",
	"OPTIONS",
	"PUT",
	"DELETE",
]);

const DEFAULT_CACHE_TTL_MS = 60_000;

const isAbortError = (error: unknown): boolean => {
	return error instanceof DOMException && error.name === "AbortError";
};

const matchesKey = (matcher: KeyMatcher, key: string): boolean => {
	if (typeof matcher === "string") return matcher === key;
	if (matcher instanceof RegExp) return matcher.test(key);
	return matcher(key);
};

const sleep = async (ms: number, signal?: AbortSignal): Promise<void> => {
	if (ms <= 0) return;

	return new Promise<void>((resolve, reject) => {
		const timer = setTimeout(() => {
			cleanup();
			resolve();
		}, ms);

		const onAbort = () => {
			clearTimeout(timer);
			cleanup();
			reject(
				signal?.reason ??
					new DOMException("The operation was aborted", "AbortError"),
			);
		};

		const cleanup = () => {
			signal?.removeEventListener("abort", onAbort);
		};

		if (signal?.aborted) {
			onAbort();
			return;
		}

		signal?.addEventListener("abort", onAbort, { once: true });
	});
};

const getRetryDelay = (attempt: number, policy: RetryPolicy): number => {
	const baseDelay = Math.min(
		policy.maxDelayMs,
		policy.baseDelayMs * 2 ** (attempt - 1),
	);
	if (!policy.jitter) return baseDelay;

	const jitterFactor = 0.5 + Math.random() * 0.5;
	return Math.round(baseDelay * jitterFactor);
};

const normalizeRetryPolicy = (
	method: HttpMethod,
	incoming?: RetryPolicyOverride,
	defaults?: HttpClientConfig["retry"],
): RetryPolicy => {
	const defaultPolicy: RetryPolicy = {
		retries: method === "GET" ? 2 : 0,
		baseDelayMs: 250,
		maxDelayMs: 2_000,
		jitter: true,
		shouldRetry: ({ error, request }) => {
			if (isAbortError(error)) return false;
			if (error instanceof HttpError) {
				return (
					RETRYABLE_STATUS_CODES.has(error.status) &&
					IDEMPOTENT_METHODS.has(request.method)
				);
			}
			return true;
		},
	};

	if (defaults) {
		if (typeof defaults.retries === "number")
			defaultPolicy.retries = defaults.retries;
		if (typeof defaults.baseDelayMs === "number")
			defaultPolicy.baseDelayMs = defaults.baseDelayMs;
		if (typeof defaults.maxDelayMs === "number")
			defaultPolicy.maxDelayMs = defaults.maxDelayMs;
		if (typeof defaults.jitter === "boolean")
			defaultPolicy.jitter = defaults.jitter;
		if (typeof defaults.shouldRetry === "function")
			defaultPolicy.shouldRetry = defaults.shouldRetry;
	}

	if (incoming === false) {
		return { ...defaultPolicy, retries: 0 };
	}

	if (incoming) {
		if (typeof incoming.retries === "number")
			defaultPolicy.retries = incoming.retries;
		if (typeof incoming.baseDelayMs === "number")
			defaultPolicy.baseDelayMs = incoming.baseDelayMs;
		if (typeof incoming.maxDelayMs === "number")
			defaultPolicy.maxDelayMs = incoming.maxDelayMs;
		if (typeof incoming.jitter === "boolean")
			defaultPolicy.jitter = incoming.jitter;
		if (typeof incoming.shouldRetry === "function")
			defaultPolicy.shouldRetry = incoming.shouldRetry;
	}

	return defaultPolicy;
};

const stableStringify = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map((item) => stableStringify(item)).join(",")}]`;
	}

	const objectValue = value as Record<string, unknown>;
	const keys = Object.keys(objectValue).sort();
	return `{${keys
		.filter((key) => objectValue[key] !== undefined)
		.map(
			(key) =>
				`${JSON.stringify(key)}:${stableStringify(objectValue[key])}`,
		)
		.join(",")}}`;
};

const mergeSignals = (
	signals: Array<AbortSignal | undefined>,
): { signal?: AbortSignal; cleanup: () => void } => {
	const activeSignals = signals.filter(
		(signal): signal is AbortSignal => signal !== undefined,
	);

	if (activeSignals.length === 0) {
		return {
			signal: undefined,
			cleanup: () => undefined,
		};
	}

	const controller = new AbortController();
	const listeners: Array<{ signal: AbortSignal; handler: () => void }> = [];

	const abortFrom = (source: AbortSignal) => {
		if (controller.signal.aborted) return;
		controller.abort(source.reason);
	};

	for (const signal of activeSignals) {
		if (signal.aborted) {
			abortFrom(signal);
			break;
		}

		const handler = () => abortFrom(signal);
		signal.addEventListener("abort", handler, { once: true });
		listeners.push({ signal, handler });
	}

	return {
		signal: controller.signal,
		cleanup: () => {
			for (const entry of listeners) {
				entry.signal.removeEventListener("abort", entry.handler);
			}
		},
	};
};

const appendQuery = (url: URL, query?: Record<string, QueryValue>): void => {
	if (!query) return;

	for (const [key, rawValue] of Object.entries(query)) {
		if (rawValue === undefined) continue;
		if (Array.isArray(rawValue)) {
			for (const part of rawValue) {
				if (part === undefined) continue;
				url.searchParams.append(key, String(part));
			}
			continue;
		}

		if (rawValue === null) {
			url.searchParams.append(key, "");
			continue;
		}

		url.searchParams.append(key, String(rawValue));
	}
};

const isBodyInit = (value: unknown): value is BodyInit => {
	return (
		typeof value === "string" ||
		value instanceof Blob ||
		value instanceof FormData ||
		value instanceof URLSearchParams ||
		value instanceof ArrayBuffer ||
		ArrayBuffer.isView(value)
	);
};

const parseJson = async <T>(response: Response): Promise<T> => {
	const text = await response.text();
	if (!text) {
		return undefined as T;
	}

	return JSON.parse(text) as T;
};

export type HttpClient = ReturnType<typeof createHttpClient>;

export const createHttpClient = (config: HttpClientConfig) => {
	const baseHeaders = new Headers(config.headers);
	const cache = new Map<string, CacheEntry>();
	const inFlight = new Map<string, Promise<unknown>>();
	const controllersByKey = new Map<string, AbortController>();

	const clearExpiredCache = (key: string) => {
		const entry = cache.get(key);
		if (!entry) return;
		if (entry.expiresAt < Date.now()) {
			cache.delete(key);
		}
	};

	const buildUrl = (
		path: string,
		query?: Record<string, QueryValue>,
	): string => {
		const url = new URL(path, config.baseUrl);
		appendQuery(url, query);
		return url.toString();
	};

	const parseBody = <TBody>(
		body: TBody | undefined,
		headers: Headers,
		serializeBody?: (body: TBody) => BodyInit | undefined,
	): BodyInit | undefined => {
		if (body === undefined || body === null) {
			return undefined;
		}

		if (serializeBody) {
			return serializeBody(body);
		}

		if (isBodyInit(body)) {
			return body;
		}

		if (!headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json");
		}

		return JSON.stringify(body);
	};

	const buildRequestKey = <TBody>(
		method: HttpMethod,
		url: string,
		body: TBody | undefined,
	): string => {
		if (body === undefined || body === null) {
			return `${method}:${url}`;
		}

		if (typeof body === "string") {
			return `${method}:${url}:${body}`;
		}

		if (isBodyInit(body)) {
			return `${method}:${url}:body`;
		}

		return `${method}:${url}:${stableStringify(body)}`;
	};

	const resolveCachePolicy = (
		method: HttpMethod,
		cachePolicy?: CachePolicy,
	): Required<CachePolicy> => {
		const mode: CacheMode =
			cachePolicy?.mode ?? (method === "GET" ? "default" : "no-store");

		const ttlMs =
			cachePolicy?.ttlMs ??
			(mode === "no-store"
				? 0
				: config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS);

		return {
			mode,
			ttlMs,
			key: cachePolicy?.key ?? "",
		};
	};

	const parseData = async <TResponse, TBody>(
		response: Response,
		request: HttpRequestConfig<TResponse, TBody>,
	): Promise<TResponse> => {
		if (request.parseResponse) {
			const customParsed = await request.parseResponse(response);
			return request.schema
				? request.schema.parse(customParsed)
				: customParsed;
		}

		const responseType = request.responseType ?? "json";
		let parsed: unknown;

		switch (responseType) {
			case "void":
				parsed = undefined;
				break;
			case "text":
				parsed = await response.text();
				break;
			case "blob":
				parsed = await response.blob();
				break;
			case "arrayBuffer":
				parsed = await response.arrayBuffer();
				break;
			case "json":
			default:
				parsed = await parseJson<unknown>(response);
				break;
		}

		return request.schema
			? request.schema.parse(parsed)
			: (parsed as TResponse);
	};

	const request = async <TResponse, TBody = unknown>(
		req: HttpRequestConfig<TResponse, TBody>,
	): Promise<TResponse> => {
		const method = (req.method ?? "GET").toUpperCase() as HttpMethod;
		const url = buildUrl(req.path, req.query);
		const cachePolicy = resolveCachePolicy(method, req.cache);
		const provisionalKey =
			req.requestKey ?? buildRequestKey(method, url, req.body);
		const requestKey = cachePolicy.key || provisionalKey;
		const dedupeKey = req.dedupeKey ?? requestKey;
		const dedupe = req.dedupe ?? method === "GET";

		if (cachePolicy.mode !== "no-store") {
			clearExpiredCache(requestKey);
			if (cachePolicy.mode !== "refresh") {
				const cached = cache.get(requestKey);
				if (cached) {
					return cached.value as TResponse;
				}
			}
		}

		if (req.cancelPrevious) {
			const previousController = controllersByKey.get(requestKey);
			if (previousController) {
				previousController.abort(
					new DOMException("Request superseded", "AbortError"),
				);
			}
		}

		if (dedupe && !req.cancelPrevious) {
			const existing = inFlight.get(dedupeKey);
			if (existing) {
				return existing as Promise<TResponse>;
			}
		}

		const execute = async (): Promise<TResponse> => {
			const headers = new Headers(baseHeaders);
			if (req.headers) {
				new Headers(req.headers).forEach((value, key) =>
					headers.set(key, value),
				);
			}

			const body = parseBody(req.body, headers, req.serializeBody);
			const keyController = new AbortController();
			controllersByKey.set(requestKey, keyController);

			let timeoutController: AbortController | undefined;
			let timeoutId: ReturnType<typeof setTimeout> | undefined;

			if (req.timeoutMs && req.timeoutMs > 0) {
				timeoutController = new AbortController();
				timeoutId = setTimeout(() => {
					timeoutController?.abort(
						new DOMException(
							`Request timeout after ${req.timeoutMs}ms`,
							"AbortError",
						),
					);
				}, req.timeoutMs);
			}

			const merged = mergeSignals([
				req.signal,
				keyController.signal,
				timeoutController?.signal,
			]);

			try {
				const response = await fetch(url, {
					method,
					headers,
					body,
					signal: merged.signal,
					credentials: req.credentials,
				});

				if (!response.ok) {
					const bodyText = await response
						.text()
						.catch(() => "<no body>");
					throw new HttpError({
						status: response.status,
						statusText: response.statusText,
						url,
						body: bodyText,
					});
				}

				return await parseData(response, req);
			} finally {
				merged.cleanup();
				if (timeoutId) clearTimeout(timeoutId);
				if (controllersByKey.get(requestKey) === keyController) {
					controllersByKey.delete(requestKey);
				}
			}
		};

		const retryPolicy = normalizeRetryPolicy(
			method,
			req.retry,
			config.retry,
		);

		const inFlightPromise = (async () => {
			let attempt = 0;

			while (true) {
				try {
					const data = await execute();

					if (
						cachePolicy.mode !== "no-store" &&
						cachePolicy.ttlMs > 0
					) {
						cache.set(requestKey, {
							value: data,
							expiresAt: Date.now() + cachePolicy.ttlMs,
						});
					}

					return data;
				} catch (error) {
					const shouldRetry =
						attempt < retryPolicy.retries &&
						retryPolicy.shouldRetry({
							attempt: attempt + 1,
							error,
							request: { method, url, requestKey },
						});

					if (!shouldRetry) {
						throw error;
					}

					attempt += 1;
					await sleep(
						getRetryDelay(attempt, retryPolicy),
						req.signal,
					);
				}
			}
		})();

		if (dedupe) {
			inFlight.set(dedupeKey, inFlightPromise);
			inFlightPromise.finally(() => {
				if (inFlight.get(dedupeKey) === inFlightPromise) {
					inFlight.delete(dedupeKey);
				}
			});
		}

		return inFlightPromise;
	};

	const abortRequest = (key: string): void => {
		const controller = controllersByKey.get(key);
		if (!controller) return;
		controller.abort(new DOMException("Request aborted", "AbortError"));
	};

	const abortAllRequests = (): void => {
		for (const controller of controllersByKey.values()) {
			controller.abort(new DOMException("Request aborted", "AbortError"));
		}
	};

	const invalidate = (matcher?: KeyMatcher): void => {
		if (!matcher) {
			cache.clear();
			return;
		}

		for (const key of cache.keys()) {
			if (matchesKey(matcher, key)) {
				cache.delete(key);
			}
		}
	};

	const clearCache = (): void => {
		cache.clear();
	};

	return {
		request,
		abortRequest,
		abortAllRequests,
		invalidate,
		clearCache,
	};
};

export { isAbortError };
