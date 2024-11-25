import { routeTabs } from "routes";
import { createContext, createSignal, useContext } from "solid-js";

const GlobalContext = createContext();

export function GlobalStateProvider(props: any) {
    const [headerTabs, setHeaderTabs] = createSignal(routeTabs);

    return (
        <GlobalContext.Provider>
            {props.children}
        </GlobalContext.Provider>
    )
}

export function useGlobalContext() { return useContext(GlobalContext) }
