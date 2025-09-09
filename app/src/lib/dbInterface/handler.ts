import { httpCoreApi, validateMessageType } from "lib/httpCoreApi";
import { Accessor, Setter } from "solid-js";
import { MojangVersionManifestSchema } from "./manifests/types/mojang";
import { z } from "zod";
import { PrismVersionManifestSchema } from "./manifests/types/prism";
import { parse } from "uuid";
import { UnifiedVersionManifestSchema } from "./manifests/types/unified/VersionManifest";

type ManifestHandlerProps = {
    dbReadyPromise: Promise<void>,
    getDBValue: (name: string) => IDBDatabase | undefined,
    extractedVersionsManifest: Accessor<Partial<ManifestDataMap>>,
    setExtractedVersionsManifest: Setter<Partial<ManifestDataMap>>,
}

export enum ManifestDBID {
    mojangVersionManifest = "mojangVersionManifest",
    prismVersionManifest = "prismVersionManifest",
    unifiedVersionManifest = "unifiedVersionManifest"
}

type SchemasMap = {
    [ManifestDBID.mojangVersionManifest]: typeof MojangVersionManifestSchema,
    [ManifestDBID.prismVersionManifest]: typeof PrismVersionManifestSchema,
    [ManifestDBID.unifiedVersionManifest]: typeof UnifiedVersionManifestSchema
};

const manifestSchemas: SchemasMap = {
    [ManifestDBID.mojangVersionManifest]: MojangVersionManifestSchema,
    [ManifestDBID.prismVersionManifest]: PrismVersionManifestSchema,
    [ManifestDBID.unifiedVersionManifest]: UnifiedVersionManifestSchema
};

export type ManifestDataMap = {
    [K in keyof SchemasMap]: z.infer<SchemasMap[K]>
};

type ManifestEntry = {
    timestamp: Date,
    data: JSON,
    id: ManifestDBID
}

export const manifestHandler = (props: ManifestHandlerProps) => {
    const dbName = "mcData";

    async function getManifest<K extends ManifestDBID>(id: K): Promise<ManifestDataMap[K] | null> {
        // retrieve from cache with correct type if exists
        const cached = props.extractedVersionsManifest()[id] as ManifestDataMap[K] | undefined;
        if (cached) return cached;

        await props.dbReadyPromise;
        const dbInstance = props.getDBValue(dbName);
        if (!dbInstance) throw new Error("Database instance is not available");

        const transaction = dbInstance.transaction("manifests", "readonly");
        const store = transaction.objectStore("manifests");
        const req = store.get(id);

        return await new Promise<ManifestDataMap[K] | null>((res, rej) => {
            req.onsuccess = async () => {
                const manifestData = req.result as ManifestEntry | undefined;
                if (manifestData) {
                    // get data from IndexedDB as JSON
                    const data = manifestData.data;

                    // validate
                    const parsed = parseManifestById(id, data);
                    if (parsed) {
                        props.setExtractedVersionsManifest(prev => ({ ...prev, [id]: parsed }));
                        res(parsed);
                        return;
                    }
                }

                // if not in the DB or not valid - download
                try {
                    const data = await httpCoreApi().getVersionsManifest(id);
                    const parsed = parseManifestById(id, data);

                    if (parsed) {
                        await setManifest(parsed, id); // save manifest to DB
                        res(parsed);
                        return;
                    }

                    res(null);
                } catch (e) {
                    rej(e);
                }
            };

            req.onerror = (e) => rej(e);
        });
    };

    async function setManifest<K extends ManifestDBID>(
        manifest: ManifestDataMap[K],
        id: K
    ): Promise<void> {
        return new Promise<void>((res, rej) => {
            const dbInstance = props.getDBValue(dbName);
            if (!dbInstance) {
                rej(new Error("Database instance is not available"));
                return;
            }

            const transaction = dbInstance.transaction("manifests", "readwrite");
            const store = transaction.objectStore("manifests");

            const manifestData: ManifestEntry = { id, timestamp: new Date(), data: manifest as unknown as JSON };
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

    const parseManifestById = <K extends ManifestDBID>(id: K, raw: unknown | JSON): ManifestDataMap[K] | false => {
        const schema = manifestSchemas[id] as unknown as z.ZodTypeAny;
        return validateMessageType(schema, raw) as ManifestDataMap[K] | false
    }

    return {
        getManifest,
        setManifest
    };
};
