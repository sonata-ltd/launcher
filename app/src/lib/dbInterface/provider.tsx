import { Accessor, createContext, createEffect, createSignal, ParentProps, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { imageHandler, InsertionOperation, LocalImageElement } from "./images/handler";
import { DBTypes } from "./types";


export type ExtractedIDBDataType = {
    localImages: LocalImageElement[] | null,
}

type Store = [
    {
        getImages: (setReactiveImagesBuffer?: Setter<LocalImageElement[]>) => Accessor<LocalImageElement[] | null>,
        setImages: (files: File[], setLastInsertion: SetStoreFunction<InsertionOperation>) => Promise<void>
    }
]

const DBDataContext = createContext<Store>();

export const DBDataProvider = (props: ParentProps) => {
    const [db, setDB] = createSignal<IDBDatabase[]>([]);
    const [extractedIDBData, setExtractedIDBData] = createStore<ExtractedIDBDataType>({
        localImages: null
    });
    const [extractedLocalImages, setExtractedLocalImages] = createSignal(extractedIDBData.localImages);

    const setDBValue = (currentDB: IDBDatabase) => {
        setDB((prev) => {
            if (prev.length) {
                return prev.map((item) => {
                    if (item.name === currentDB.name) {
                        return currentDB;
                    }

                    return item;
                })
            } else {
                return [currentDB];
            }
        });
    }

    const getDBValue = (name: string): IDBDatabase | undefined => {
        const value = db().find((e) => e.name === name);
        return value;
    }

    createEffect(() => {
        initDB(DBTypes.localImages);
    })

    const initDB = (dbName: string) => {
        const req = indexedDB.open(dbName, 1);

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
            setDBValue(req.result);
        }
    }


    const { getImages, setImages } = imageHandler({ getDBValue, extractedLocalImages, setExtractedLocalImages });

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
