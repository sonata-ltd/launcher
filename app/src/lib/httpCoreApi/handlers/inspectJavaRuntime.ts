import { apiUrl } from "../constants";
import { createHttpClient } from "../core/httpClient";
import { createHttpResource } from "../core/createHttpResource";

const inspectJavaRuntimeClient = createHttpClient({
	baseUrl: apiUrl.host,
});

const inspectJavaRuntime = <T = unknown>(path: () => string | undefined) =>
	createHttpResource<string, T>(
		path,
		(currentPath) => ({
			path: apiUrl.endpoints.inpectJavaRunime,
			method: "POST",
			body: currentPath,
			headers: {
				"Content-Type": "text/plain",
			},
			retry: false,
			cache: {
				mode: "no-store",
			},
			dedupe: false,
			requestKey: "inspect-java-runtime-resource",
			cancelPrevious: true,
		}),
		inspectJavaRuntimeClient,
	);

export { inspectJavaRuntime };
