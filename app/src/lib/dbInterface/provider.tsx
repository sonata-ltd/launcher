import { Accessor, createContext, createEffect, createSignal, ParentProps, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { imageHandler, InsertionImagesStore, InsertionOperation, LocalImageElement, LocalImageEntry } from "./images/handler";


enum AcessorTypes {
    IMAGES = "localImages"
}

export type ExtractedIDBDataType = {
    localImages: string[],
}

type Store = [
    {
        getImages: (setReactiveImagesBuffer?: Setter<LocalImageElement[]>) => Accessor<LocalImageElement[] | null>,
        setImages: (files: File[], setLastInsertion: SetStoreFunction<InsertionOperation>) => Promise<void>
    }
]

const DBDataContext = createContext<Store>();

export const DBDataProvider = (props: ParentProps) => {
    const [db, setDB] = createSignal<IDBDatabase | null>(null);
    const [extractedIDBData, setExtractedIDBData] = createSignal<LocalImageElement[] | null>(null);

    const { getImages, setImages } = imageHandler({ db, setDB, extractedIDBData, setExtractedIDBData });

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
