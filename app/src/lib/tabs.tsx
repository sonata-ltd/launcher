import { initialTabs } from "routes";
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";


export interface Tab {
    name: string;
    path: string;
}

type Store = [
    Accessor<Tab[]>,
    {
        addHeaderTab: (tab: Tab) => void,
        removeHeaderTab: (path: string) => void,
    }
]

const TabsContext = createContext<Store>();

export function TabsProvider(props: { children: JSX.Element }) {
    const [headerTabs, setHeaderTabs] = createSignal(initialTabs),
        store = [
            headerTabs,
            {
                addHeaderTab(tab: Tab) {
                    setHeaderTabs((prev) => [...prev, tab]);
                },
                removeHeaderTab(path: string) {
                    setHeaderTabs((prev) => prev.filter((t) => t.path !== path));
                },
            },
        ];

    return (
        <TabsContext.Provider value={store}>
            {props.children}
        </TabsContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error("useTabs must be used inside TabsProvider");
    }

    return context;
}
