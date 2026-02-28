import { useLogger } from "lib/logger";
import {
	Accessor,
	createContext,
	createEffect,
	createSignal,
	JSX,
	onCleanup,
	onMount,
	Owner,
	ParentProps,
	useContext,
} from "solid-js";

type routedElement = {
	path: string;
	scrollY: number;
	scrollX: number;
};

type CachedElement = {
	id: string;
	owner: Owner;
	children: JSX.Element;
};

type Store = [
	Accessor<string>,
	{
		setRoute: (path: string) => void;
		getScrollValues: (path: string) => [number, number];
	},
];

const LocalRouterContext = createContext<Store>([
	() => "",
	{
		setRoute: () => void 0,
		getScrollValues: () => [0, 0] as [number, number],
	},
]);

export const LocalRouterProvider = (props: ParentProps) => {
	const [{ log }] = useLogger();
	const [currentRoute, setCurrentRoute] = createSignal(
		window.location.pathname,
	);
	const [routedElements, setRoutedElements] = createSignal<routedElement[]>(
		[],
	);

	onMount(() => {
		const handlePopState = () => {
			setCurrentRoute(window.location.pathname);
		};

		window.addEventListener("popstate", handlePopState);
		onCleanup(() => window.removeEventListener("popstate", handlePopState));
	});

	const store: Store = [
		currentRoute,
		{
			setRoute(path: string) {
				setRoutedElements((prev) => {
					const index = prev.findIndex(
						(item) => item.path === currentRoute(),
					);
					const newElement = {
						path: currentRoute(),
						scrollY: window.scrollY,
						scrollX: window.scrollX,
					};

					if (index !== -1) {
						return prev.map((item, i) =>
							i === index ? newElement : item,
						);
					} else {
						return [...prev, newElement];
					}
				});

				window.history.pushState({}, "", path);
				setCurrentRoute(path);
				log("localRouter.urlChange", "Url changed to: " + path);
			},

			getScrollValues(path: string) {
				const e = routedElements().find((e) => e.path === path);
				return e ? [e.scrollY, e.scrollX] : [0, 0];
			},
		},
	];

	return (
		<LocalRouterContext.Provider value={store}>
			{props.children}
		</LocalRouterContext.Provider>
	);
};

export const useLocalRouter = () => {
	return useContext(LocalRouterContext);
};
