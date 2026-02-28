import { Component, createSignal, JSX, lazy } from "solid-js";

const join = (...parts: string[]) => "/" + parts.filter(Boolean).join("/");

const debugPath = (...parts: string[]) => join("debug", ...parts);
const debugUikitPath = (...parts: string[]) => debugPath("debug", ...parts);

export const routeNames = {
	NEWS: "/",
	INSTANCES: "/instances",
	DEBUG: debugPath(),
	DEBUG_SELECTABLETABLE: debugUikitPath("selectable-table"),
	DEBUG_TYPO: debugUikitPath("typography"),
	DEBUG_COLORS: debugUikitPath("debug/uikit/colors"),
};

export let initialTabs = [
	{
		name: "News",
		path: routeNames.NEWS,
	},
	{
		name: "Instances",
		path: routeNames.INSTANCES,
	},
	{
		name: "Debug: UIKit",
		path: routeNames.DEBUG,
	},
];

export interface route {
	path: string;
	component: Component;
}

export const routes: route[] = [
	{
		path: routeNames.NEWS,
		component: lazy(() => import("./pages/NewsList/news.tsx")),
	},
	{
		path: routeNames.INSTANCES,
		component: lazy(() => import(`./pages/Instances/instances.tsx`)),
	},
	{
		path: routeNames.DEBUG,
		component: lazy(() => import("./pages/Debug/rendering.tsx")),
	},
	{
		path: "*404",
		component: lazy(() => import("./pages/404.tsx")),
	},
];
