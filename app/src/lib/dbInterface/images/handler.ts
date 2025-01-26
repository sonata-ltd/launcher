import { Accessor, Setter } from "solid-js";
import { wrap } from "comlink";
import { ImageWorkerAPI } from "lib/webWorkers/imageProcessor";
import ImageProcessorWorker from "@/lib/webWorkers/imageProcessor.ts?worker";
import { preview } from "vite";
import { SetStoreFunction } from "solid-js/store";
import { ExtractedIDBDataType } from "../provider";


type LocalImage = {
    id: string,
    name: string
}

export type LocalImageEntry = LocalImage & {
    preview: Blob,
}

export type LocalImageElement = LocalImage & {
    preview: string | undefined
}

export type InsertionOperation = {
    isRunning: boolean,
    inserted: number,
    total: number,
}

export type InsertionImagesStore = {
    images: LocalImageElement[],
    inserted: number,
    lastOperation: InsertionOperation,
}

type ImageHandlerProps = {
    getDBValue: (name: string) => IDBDatabase | undefined,
    extractedLocalImages: Accessor<LocalImageElement[] | null>,
    setExtractedLocalImages: Setter<LocalImageElement[] | null>
}

const imageProcessor = wrap<ImageWorkerAPI>(new ImageProcessorWorker());

export const imageHandler = (props: ImageHandlerProps) => {
    const dbName = "localImages";

    const getImages = (setReactiveImagesBuffer?: Setter<LocalImageElement[]>): Accessor<LocalImageElement[] | null> => {
        if (props.extractedLocalImages() !== null)
            return props.extractedLocalImages;

        requestImagesExtraction(setReactiveImagesBuffer);
        return props.extractedLocalImages;
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
        const dbInstance = props.getDBValue(dbName);
        if (!dbInstance) return;

        setLastInsertion("isRunning", true);
        setLastInsertion("inserted", 0);

        for (const file of files) {
            try {
                const { id, src } = await imageProcessor.processFile(file);

                // I don't think that we need to store the original file
                // const blob = await imageProcessor.genFileBlob(file);

                const previewBlob = await imageProcessor.genFilePreview(file);
                const transaction = dbInstance.transaction("images", "readwrite");
                const store = transaction.objectStore("images");

                const imageData = { id, name: file.name, preview: previewBlob } as LocalImageEntry;

                store.add(imageData);

                await new Promise<void>((res, rej) => {
                    transaction.oncomplete = () => {
                        const adaptedImageData = {
                            ...imageData,
                            // src: URL.createObjectURL(imageData.src),
                            preview: URL.createObjectURL(imageData.preview)
                        } as LocalImageElement;

                        props.setExtractedLocalImages((prev) => {
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
            } catch (e) {
                console.error(e);
            }
        }
    }

    const requestImagesExtraction = async (setReactiveImagesBuffer?: Setter<LocalImageElement[]>) => {
        const imagesBuffer: LocalImageElement[] = [];

        const dbInstance = props.getDBValue(dbName);
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
                        preview: URL.createObjectURL(value.preview as Blob)
                    } as LocalImageElement;

                    imagesBuffer.push(valueWithBlob);

                    if (setReactiveImagesBuffer) {
                        setReactiveImagesBuffer((prev) => [
                            ...prev,
                            valueWithBlob
                        ])
                    }

                    cursor.continue();
                } else {
                    props.setExtractedLocalImages(imagesBuffer);
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
