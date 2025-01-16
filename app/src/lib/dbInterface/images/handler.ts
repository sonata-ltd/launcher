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

export type InsertionOperation = {
    isRunning: boolean,
    inserted: number,
    total: number
}

export type InsertionImagesStore = {
    images: LocalImageElement[],
    inserted: number,
    lastOperation: InsertionOperation
}

type ImageHandlerProps = {
    db: Accessor<IDBDatabase | null>,
    setDB: Setter<IDBDatabase | null>,
    extractedIDBData: Accessor<LocalImageElement[] | null>,
    setExtractedIDBData: Setter<LocalImageElement[] | null>
}

const imageProcessor = wrap<ImageWorkerAPI>(new ImageProcessorWorker());

export const imageHandler = (props: ImageHandlerProps) => {

    const getImages = (setReactiveImagesBuffer?: Setter<LocalImageElement[]>): Accessor<LocalImageElement[] | null> => {
        if (props.extractedIDBData() !== null)
            return props.extractedIDBData;

        requestImagesExtraction(setReactiveImagesBuffer);
        return props.extractedIDBData;
    }

    const setImages = (files: File[], setInsertionStore: SetStoreFunction<InsertionOperation>): Promise<void> => {
        return new Promise<void>((res, rej) => {
            requestImagesInsertion(files, setInsertionStore)
                .then(() => res())
                .catch((e) => {
                    console.error(e);
                    rej(e);
                })
        })
    }

    const requestImagesInsertion = async (files: File[], setLastInsertion: SetStoreFunction<InsertionOperation>) => {
        const dbInstance = props.db();
        if (!dbInstance) return;

        setLastInsertion("isRunning", true);
        setLastInsertion("inserted", 0);

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

                        setLastInsertion("inserted", (prev) => prev + 1);

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
    }

    const requestImagesExtraction = async (setReactiveImagesBuffer?: Setter<LocalImageElement[]>) => {
        const imagesBuffer: LocalImageElement[] = [];

        const dbInstance = props.db();
        if (!dbInstance) return;

        const transaction = dbInstance.transaction("images", "readonly");
        const store = transaction.objectStore("images");

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
                    if (setReactiveImagesBuffer) {
                        setReactiveImagesBuffer((prev) => [
                            ...prev,
                            valueWithBlob
                        ])

                        console.log(valueWithBlob);
                    }

                    cursor.continue();
                } else {
                    props.setExtractedIDBData(imagesBuffer);
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
