import { Accessor, Setter } from "solid-js";
import { wrap } from "comlink";
import { ImageWorkerAPI } from "lib/webWorkers/imageProcessor";
import ImageProcessorWorker from "@/lib/webWorkers/imageProcessor.ts?worker";
import { preview } from "vite";
import { SetStoreFunction } from "solid-js/store";


type LocalImage = {
    id: string,
    name: string
}

export type LocalImageEntry = LocalImage & {
    src: Blob,
    preview: Blob,
}

export type LocalImageElement = LocalImage & {
    src: string,
    preview: string
}

export type InsertionImagesStore = {
    isRunning: boolean,
    inserted: number,
    total: number
}

type ImageHandlerProps = {
    db: Accessor<IDBDatabase | null>,
    setDB: Setter<IDBDatabase | null>,
    extractedIDBData: Accessor<LocalImageElement[] | null>,
    setExtractedIDBData: Setter<LocalImageElement[] | null>
}

const imageProcessor = wrap<ImageWorkerAPI>(new ImageProcessorWorker());

export const imageHandler = (props: ImageHandlerProps) => {

    const getImages = (): Accessor<LocalImageElement[] | null> => {
        if (props.extractedIDBData() !== null)
            return props.extractedIDBData;

        requestImagesExtraction();
        return props.extractedIDBData;
    }

    const setImages = (files: File[], setInsertionStore: SetStoreFunction<InsertionImagesStore>): Promise<void> => {
        return new Promise<void>((res, rej) => {
            requestImagesInsertion(files, setInsertionStore)
                .then(() => res())
                .catch((e) => {
                    console.error(e);
                    rej(e);
                })
        })
    }

    const requestImagesInsertion = async (files: File[], setInsertionStore: SetStoreFunction<InsertionImagesStore>) => {
        const dbInstance = props.db();
        if (!dbInstance) return;

        setInsertionStore("isRunning", true);
        setInsertionStore("inserted", 0);
        setInsertionStore("total", files.length);

        try {
            for (const file of files) {
                const { id, src } = await imageProcessor.processFile(file);
                const blob = await imageProcessor.genFileBlob(file);
                const previewBlob = await imageProcessor.genFilePreview(file);
                const transaction = dbInstance.transaction("images", "readwrite");
                const store = transaction.objectStore("images");

                const imageData = { id, name: file.name, src: blob, preview: previewBlob } as LocalImageEntry;

                store.add(imageData);

                await new Promise<void>((res, rej) => {
                    transaction.oncomplete = () => {
                        const adaptedImageData = {
                            ...imageData,
                            src: URL.createObjectURL(imageData.src),
                            preview: URL.createObjectURL(imageData.preview)
                        } as LocalImageElement;

                        props.setExtractedIDBData((prev) => {
                            if (prev !== null) {
                                return [
                                    ...prev,
                                    adaptedImageData
                                ]
                            } else {
                                return [adaptedImageData]
                            }
                        })

                        setInsertionStore("inserted", (prev) => prev + 1);

                        res();
                    }
                    transaction.onerror = (e) => {
                        rej(e);
                    }
                })
            }
        } catch (e) {
            console.error(e);
        }

        setInsertionStore("isRunning", false);
        setInsertionStore("inserted", 0);
        setInsertionStore("total", 0);
    }

    const requestImagesExtraction = async () => {
        const dbInstance = props.db();
        if (!dbInstance) return;

        const transaction = dbInstance.transaction("images", "readonly");
        const store = transaction.objectStore("images");

        const imagesBuffer: LocalImageElement[] = [];

        console.log("start");

        await new Promise<void>((res, rej) => {
            const req = store.openCursor()

            req.onsuccess = () => {
                const cursor = req.result;

                if (cursor) {
                    const value = cursor.value;
                    const valueWithBlob = {
                        ...value,
                        preview: URL.createObjectURL(value.preview as Blob),
                        src: URL.createObjectURL(value.src as Blob)
                    } as LocalImageElement;

                    imagesBuffer.push(valueWithBlob);

                    cursor.continue();
                } else {
                    props.setExtractedIDBData(imagesBuffer);
                    console.log("EXTRACTED!!!!!");
                    res();
                }
            }

            req.onerror = (e) => {
                rej(e);
            }
        })
    }

    return {
        getImages,
        setImages
    }
}
