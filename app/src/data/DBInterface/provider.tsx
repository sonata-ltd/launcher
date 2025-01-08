import { createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";


enum AcessorTypes {
    IMAGES = "localImages"
}

type DBDataStore = {
    nativeImages: string[],
    localImages: string[],
}

const LSManagerContext = createContext();

export const LSManagerProvider = (props: ParentProps) => {
    const [data, setData] = createSignal<IDBDatabase | null>(null);

    createEffect(() => {
        const req = indexedDB.open("localImages", 3);

        req.onerror = (e) => {
            console.error(e);
        }

        req.onsuccess = (e) => {
            console.log(e);
        }
    })

    return (
        <LSManagerContext.Provider value={store}>
            {props.children}
        </LSManagerContext.Provider>
    )
}

export const useLSManager = () => {
    const context = useContext(LSManagerContext);

    if (!context) {
        throw new Error("useLSManager should be used inside LSManagerProvder");
    }

    return context;
}
