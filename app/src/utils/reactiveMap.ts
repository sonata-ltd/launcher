import { createSignal } from "solid-js";

export type SignalPair<T> = [() => T, (v: T | ((p: T) => T)) => void];

export function useReactiveMap<T>() {
	const map = new Map<string, SignalPair<T>>();
	const [keys, setKeys] = createSignal<string[]>([]);

	function has(key: string) {
		return map.has(key);
	}

	function getPair(key: string): SignalPair<T> | undefined {
		return map.get(key);
	}

	function get(key: string): T | undefined {
		const pair = map.get(key);
		return pair ? pair[0]() : undefined;
	}

	function set(key: string, value: T | ((p?: T) => T)) {
		if (map.has(key)) {
			const [, setter] = map.get(key)!;

			setter(
				typeof value === "function"
					? (value as (p?: T) => T)(undefined)
					: value,
			);
		} else {
			// Initial value => create new key
			const initialValue =
				typeof value === "function"
					? (value as (p?: T) => T)(undefined)
					: value;

			const pair = createSignal<T>(initialValue);

			map.set(key, pair as SignalPair<T>);
			setKeys((prev) => [...prev, key]);
		}
	}

	function deleteKey(key: string) {
		if (!map.has(key)) return;

		map.delete(key);
		setKeys((prev) => prev.filter((k) => k !== key));
	}

	function clear() {
		map.clear();
		setKeys([]);
	}

	return {
		keys,
		has,
		getPair,
		get,
		set,
		deleteKey,
		clear,
	} as const;
}
