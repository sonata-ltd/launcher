import { useLogger } from "lib/logger";
import { Accessor, createContext, createSignal, Owner, ParentProps, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";

export interface KeepAliveElement {
    id: string,
    owner: Owner | null,
    children: JSX.Element,
    dispose: () => void,
}

export type Store = [
    Accessor<KeepAliveElement[]>,
    {
        insert: (element: KeepAliveElement) => KeepAliveElement | undefined;
    }
];

const KeepAliveContext = createContext<Store>();

export const KeepAliveProvider = (
    props: ParentProps
) => {
    const [{ log }] = useLogger();
    const [keepAliveElements, setKeepAliveElements] = createSignal<
        KeepAliveElement[]
    >([]);

    const insert = (e: KeepAliveElement) => {
        setKeepAliveElements((prev) => {
            const newElements = [...prev, e];
            return newElements;
        })

        log("keepAlive.cacheChange", `Cached new element with id: "${e.id}". Total cache: ${keepAliveElements().length}`);

        return e;
    }

    const store: Store = [
        keepAliveElements,
        {
            insert
        }
    ];

    return (
        <KeepAliveContext.Provider value={store}>
            {props.children}
        </KeepAliveContext.Provider>
    )
}

export const useKeepAlive = () => {
    const context = useContext(KeepAliveContext);

    if (!context) {
      throw new Error("KeepAlive must be used inside KeepAliveProvider");
    }

    return context;

}
