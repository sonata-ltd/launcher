import { createContext, createEffect, ParentProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";


enum AcessorTypes {
    IMAGES = "localImages"
}

type lsDataStore = {
    nativeImages: string[],
    localImages: string[],
}

const LSManagerContext = createContext();

export const LSManagerProvider = (props: ParentProps) => {
    const [data, setData] = createStore<lsDataStore>({
        nativeImages: [],
        localImages: [],
    });

    const importLSData = (key: AcessorTypes) => {
        console.log(key);
        const storedData = localStorage.getItem(key);

        if (storedData) {
            console.log(JSON.parse(storedData));
        }
    }

    const exportLSData = (key: AcessorTypes) => {
        localStorage.setItem(key, JSON.stringify(data.localImages));
    }

    const addImage = (isNative: boolean, path: string) => {
        setData("localImages", data.localImages.length, path);
        console.log(data);
    }

    createEffect(() => {
        exportLSData(AcessorTypes.IMAGES);
    }, [data])

    const store = [
        data,
        {
            addImage
        }
    ]

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
