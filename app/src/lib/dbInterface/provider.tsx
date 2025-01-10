import { Accessor, createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { imageHandler, LocalImageElement, LocalImageEntry } from "./images/handler";


enum AcessorTypes {
    IMAGES = "localImages"
}

export type ExtractedIDBDataType = {
    localImages: string[],
}

type Store = [
    {
        getImages: () => Accessor<LocalImageElement[] | null>,
        setImages: (files: File[], insertedAccessor: any) => Promise<void>
    }
]

const DBDataContext = createContext<Store>();

export const DBDataProvider = (props: ParentProps) => {
    const [db, setDB] = createSignal<IDBDatabase | null>(null);
    const [extractedIDBData, setExtractedIDBData] = createSignal<LocalImageElement[] | null>(null);

    const { getImages, setImages } = imageHandler({ db, setDB, extractedIDBData, setExtractedIDBData });

    createEffect(() => {
        console.log(extractedIDBData());
    })

    createEffect(() => {
        const req = indexedDB.open("localImages", 1);

        req.onupgradeneeded = () => {
            const db = req.result;

            if (!db.objectStoreNames.contains("images")) {
                db.createObjectStore("images", { keyPath: "id" });
            }
        }

        req.onerror = (e) => {
            console.error(e);
        }

        req.onsuccess = (e) => {
            setDB(req.result);
        }
    })


    const store: Store = [
        {
            getImages,
            setImages
        }
    ];

    return (
        <DBDataContext.Provider value={store}>
            {props.children}
        </DBDataContext.Provider>
    )
}

export const useDBData = () => {
    const context = useContext(DBDataContext);

    if (!context) {
        throw new Error("useDBData should be used inside DBDataProvider");
    }

    return context;
}
