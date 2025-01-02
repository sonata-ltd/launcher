import { Component, createSignal, JSX, lazy } from "solid-js";


export const routeNames = {
    NEWS: "/",
    INSTANCES: "/instances",
    DEBUG: "/debug/uikit",
    DEBUG_TYPO: "/debug/uikit/typography",
    DEBUG_COLORS: "/debug/uikit/colors",
};

export let initialTabs = [
    {
        name: "News",
        path: routeNames.NEWS
    },
    {
        name: "Instances",
        path: routeNames.INSTANCES
    },
    {
        name: "Debug: UIKit",
        path: routeNames.DEBUG
    }
]

export interface route {
    path: string,
    component: Component,
}

export const routes: route[] = [
    {
        path: routeNames.NEWS,
        component: lazy(() => import("@/pages/NewsList/news.tsx")),
    },
    {
        path: routeNames.INSTANCES,
        component: lazy(() => import(`@/pages/Instances/instances.tsx`)),
    },
    {
        path: "/debug/uikit",
        component: lazy(() => import("@/pages/Debug/rendering.tsx")),
    },
    {
        path: "/debug/uikit/typography",
        component: lazy(() => import("@/pages/Debug/Typography/typography.tsx")),
    },
    {
        path: "/debug/uikit/colors",
        component: lazy(() => import("@/pages/Debug/Colors/colors.tsx")),
    },
    {
        path: "*404",
        component: lazy(() => import("@/pages/404.tsx")),
    }
]
