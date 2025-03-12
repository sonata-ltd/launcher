import { Accessor, Setter } from "solid-js";

type ManifestHandlerProps = {
    dbReadyPromise: Promise<void>,
    getDBValue: (name: string) => IDBDatabase | undefined,
    extractedVersionsManifest: Accessor<{ [key in ManifestDBID]?: JSON }>,
    setExtractedVersionsManifest: Setter<{ [key in ManifestDBID]?: JSON }>,
}

export enum ManifestDBID {
    globalVersionManifest = "globalVersionManifest"
}

type ManifestEntry = {
    timestamp: Date,
    data: JSON,
    id: ManifestDBID
}

export const manifestHandler = (props: ManifestHandlerProps) => {
    const dbName = "mcData";

    const getManifest = (id: ManifestDBID): Promise<JSON | null> => {
        return new Promise<JSON | null>(async (res, rej) => {

            const cachedManifest = props.extractedVersionsManifest()[id];
            if (cachedManifest) {
                res(cachedManifest);
                return;
            }

            await props.dbReadyPromise;

            const dbInstance = props.getDBValue(dbName);
            if (!dbInstance) {
                rej(new Error("Database instance is not available"));
                return;
            }

            const transaction = dbInstance.transaction("manifests", "readonly");
            const store = transaction.objectStore("manifests");
            const req = store.get(id);

            req.onsuccess = () => {
                const manifestData = req.result as ManifestEntry | undefined;

                if (manifestData) {
                    props.setExtractedVersionsManifest(prev => ({ ...prev, [id]: manifestData.data }));
                    res(manifestData.data);
                } else {
                    res(null);
                }
            };

            req.onerror = (e) => {
                rej(e);
            };
        });
    };

    const setManifest = async (manifest: JSON, id: ManifestDBID): Promise<void> => {
        return new Promise<void>((res, rej) => {
            const dbInstance = props.getDBValue(dbName);
            if (!dbInstance) {
                rej(new Error("Database instance is not available"));
                return;
            }

            const transaction = dbInstance.transaction("manifests", "readwrite");
            const store = transaction.objectStore("manifests");

            const manifestData: ManifestEntry = { id, timestamp: new Date(), data: manifest };
            store.put(manifestData);

            transaction.oncomplete = () => {
                props.setExtractedVersionsManifest(prev => ({ ...prev, [id]: manifest }));
                res();
            };
            transaction.onerror = (e) => {
                rej(e);
            };
        });
    };

    return {
        getManifest,
        setManifest
    };
};
