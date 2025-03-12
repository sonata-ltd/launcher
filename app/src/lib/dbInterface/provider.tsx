import { Accessor, createContext, createEffect, createSignal, ParentProps, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { imageHandler, InsertionOperation, LocalImageElement } from "./images/handler";
import { DBTypes } from "./types";
import { ManifestDBID, manifestHandler } from "./manifests/handler";

type TableDefinition = { keyPath: string, autoIncrement: boolean, name: string }

type DBTypeTables = {
    localImages: TableDefinition[],
    mcData: TableDefinition[]
}

const DBTypeTables: DBTypeTables = {
    localImages: [
        {
            keyPath: "id",
            autoIncrement: false,
            name: "images"
        }
    ],
    mcData: [
        {
            keyPath: "id",
            autoIncrement: false,
            name: "manifests"
        }
    ]
}

export type ExtractedIDBDataType = {
    localImages: LocalImageElement[] | null,
    versionsManifest: { [key in ManifestDBID]?: JSON }
}

type Store = [
    {
        getImages: (setReactiveImagesBuffer?: Setter<LocalImageElement[]>) => Accessor<LocalImageElement[] | null>,
        setImages: (files: File[], setLastInsertion: SetStoreFunction<InsertionOperation>) => Promise<void>,
        getManifest: (id: ManifestDBID) => Promise<JSON | null>,
        setManifest: (manifest: JSON, id: ManifestDBID) => Promise<void>
    }
]

const DBDataContext = createContext<Store>();

export const DBDataProvider = (props: ParentProps) => {
    const [dbReady, setDBReady] = createSignal(false);
    const [db, setDB] = createSignal<IDBDatabase[]>([]);
    const [extractedIDBData, setExtractedIDBData] = createStore<ExtractedIDBDataType>({
        localImages: null,
        versionsManifest: {}
    });

    const dbReadyPromise = new Promise<void>((resolve) => {
        createEffect(() => {
            if (dbReady()) {
                resolve();
            }
        });
    });

    const setDBValue = (currentDB: IDBDatabase) => {
        setDB((prev) => {
            const exists = prev.some((item) => item.name === currentDB.name);
            if (exists) {
                return prev.map((item) => (item.name === currentDB.name ? currentDB : item));
            } else {
                return [...prev, currentDB];
            }
        });
    }

    const getDBValue = (name: string): IDBDatabase | undefined => {
        console.log(name);
        console.log(db());
        return db().find((e) => e.name === name);
    }

    createEffect(() => {
        Promise.all([
            initDB(DBTypes.localImages, DBTypeTables.localImages),
            initDB(DBTypes.mcData, DBTypeTables.mcData)
        ]).then(() => {
            setDBReady(true);
        }).catch((err) => {
            console.error(err);
        })
    })

    const initDB = (dbName: string, tableDataset: TableDefinition[]) => {
        return new Promise<void>((res, rej) => {
            const req = indexedDB.open(dbName, 1);

            req.onupgradeneeded = () => {
                tableDataset.forEach((dataset) => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(dataset.name)) {
                        db.createObjectStore(dataset.name, {
                            keyPath: dataset.keyPath,
                            autoIncrement: dataset.autoIncrement
                        });
                    }
                })
            }

            req.onerror = (e) => {
                console.error(e);
                rej(e);
            }

            req.onsuccess = () => {
                setDBValue(req.result);
                res();
            }
        })
    }

    const { getImages, setImages } = imageHandler({
        getDBValue,
        dbReadyPromise,
        extractedLocalImages: () => extractedIDBData.localImages,
        setExtractedLocalImages: (images) => setExtractedIDBData("localImages", images)
    });

    const { getManifest, setManifest } = manifestHandler({
        getDBValue,
        dbReadyPromise,
        extractedVersionsManifest: () => extractedIDBData.versionsManifest,
        setExtractedVersionsManifest: (manifests) => setExtractedIDBData("versionsManifest", manifests)
    });

    const store: Store = [
        {
            getImages,
            setImages,
            getManifest,
            setManifest
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
