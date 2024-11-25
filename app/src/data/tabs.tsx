import { initialTabs } from "routes";
import { createSignal, createContext, useContext } from "solid-js";

export interface Tab {
    name: string;
    path: string;
}

const TabsContext = createContext();

export function TabsProvider(props: any) {
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
    return useContext(TabsContext);
}
