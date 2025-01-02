import { useLogger } from "data/logger";
import { createSign } from "node:crypto";
import { Accessor, createContext, createEffect, createSignal, JSX, Owner, ParentProps, useContext } from "solid-js";


type routedElement = {
    path: string,
    scrollY: number,
    scrollX: number
}

type CachedElement = {
    id: string,
    owner: Owner,
    children: JSX.Element,
}

type Store = [
    Accessor<string>,
    {
        setRoute: (path: string) => void,
        getScrollValues: (path: string) => [number, number]
    }
]


const LocalRouterContext = createContext<Store>([
    () => "",
    {
        setRoute: () => void 0,
        getScrollValues: () => [0, 0] as [number, number]
    }
]);

export const LocalRouterProvider = (props: ParentProps) => {
    const [{ log }] = useLogger();
    const [currentRoute, setCurrentRoute] = createSignal(window.location.pathname);
    const [routedElements, setRoutedElements] = createSignal<routedElement[]>([]);

    const store: Store = [
            currentRoute,
            {
                setRoute(path: string) {
                    setRoutedElements((prev) => {
                        const index = prev.findIndex(item => item.path === currentRoute());

                        if (index !== -1) {
                            prev[index] = {
                                ...prev[index],
                                scrollY: window.scrollY,
                                scrollX: window.scrollX
                            };
                        } else {
                            prev.push({
                                path: currentRoute(),
                                scrollY: window.scrollY,
                                scrollX: window.scrollX
                            });
                        }

                        return [...prev];
                    })

                    window.history.pushState({}, "", path);
                    setCurrentRoute(path);
                    log("localRouter.urlChange", "Url changed to: " + path);
                },

                getScrollValues(path: string) {
                    const e = routedElements().find(e => e.path === currentRoute());

                    if (e) {
                        return [ e.scrollY, e.scrollX ];
                    } else {
                        return [0, 0];
                    }
                }
            }
        ];


    return (
        <LocalRouterContext.Provider value={store}>
            {props.children}
        </LocalRouterContext.Provider>
    )
}

export const useLocalRouter = () => {
    return useContext(LocalRouterContext);
}
