import { Accessor, createEffect, createRoot, createSignal, For, Setter, Show } from "solid-js"
import { ContentStack, Window } from "uikit/components/Window";

import css from "./imageBrowser.module.less";
import Button from "uikit/components/Button";
import { ContentWrapper, WindowControls } from "uikit/components/Window/window";
import { Layout_Grid_01 } from "components/Icons/layout-grid-01";
import { useLSManager } from "data/DBInterface/provider";
import { createSign } from "node:crypto";
import { ButtonTypes } from "uikit/components/Button/button";


type LocalImageEntry = {
    id: string,
    name: string,
    src: string
}

type ImageBroserProps = {
    zIndex?: number,
    imageUrl: Setter<string>,
    visible: Accessor<boolean>
}

export const ImageBrowser = (props: ImageBroserProps) => {
    const tauriAvailable = window.__TAURI__;

    const [isWindowVisible, setWindowVisible] = createSignal(true);
    const [isUIBlocked, setUIBlocked] = createSignal(false);
    const [selectedImage, setSelectedImage] = createSignal<
        undefined | { name: string, secondAttribute: string }
    >(undefined);


    const [db, setDB] = createSignal<IDBDatabase | null>(null);
    const [images, setImages] = createSignal<undefined | LocalImageEntry[]>(undefined);

    const genFileId = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        return hashHex;
    }

    const fetchImages = () => {
        if (!db()) return;

        const transaction = db()!.transaction("images", "readonly");
        const store = transaction.objectStore("images");

        const req = store.getAll()

        req.onsuccess = () => {
            setImages(req.result as LocalImageEntry[]);
        }

        req.onerror = (e) => {
            console.error(e);
        }
    }

    const saveImage = async (file: File) => {
        if (!db()) {
            console.warn("DB is not init");
            return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
            const id = await genFileId(file);
            const transaction = db()!.transaction("images", "readwrite");
            const store = transaction.objectStore("images");

            store.add({ id, name: file.name,  src: reader.result });
            transaction.oncomplete = () => fetchImages();
        }

        reader.onerror = (e) => {
            console.error(e);
        }

        reader.readAsDataURL(file);
    }

    createEffect(() => {
        console.log(images());
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
            fetchImages();
        }
    })

    createEffect(() => {
        console.log("dbData update: ", db());
    })


    const pickImage = async () => {
        setUIBlocked(true);

        // Check tauri API availability
        // if (tauriAvailable) {
        //     try {
        //         const { open } = window.__TAURI__.dialog;
        //         const input = await open({
        //             multiple: true,
        //             directory: false,
        //         });

        //         console.log(input);

        //         setUIBlocked(false);
        //     } catch (error) {
        //         console.error('Failed to open dialog using Tauri API:', error);

        //         setUIBlocked(false);
        //     }
        // } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = "image/png, image/jpeg, image/gif, image/svg";

            input.onchange = () => {
                const rawInput = input.files;
                if (rawInput) {
                    const files = Array.from(rawInput);
                    console.log('File is chosen using default dialog:', files);

                    files.forEach((file) => {
                        saveImage(file);
                    })

                    setUIBlocked(false);
                }
            };

            input.click();
        // }
    };


    createEffect(() => {
        console.log(selectedImage());
    })

    return (
        <>
            <Window
                visible={isWindowVisible}
                setVisible={setWindowVisible}
                name={"Image Browser"}
                width={750}
            >
                <ContentWrapper>
                    <Show
                        when={images() !== undefined}
                        fallback={
                            <p>Loading...</p>
                        }
                    >
                        <div class={css["image-browser"]}>
                            <div class={css["controls-wrapper"]}>
                                <Button
                                    primary
                                    onClick={() => pickImage()}
                                >
                                    Add
                                </Button>
                                <div class={css["img-props-container"]}>
                                    {selectedImage() === undefined
                                        ? (
                                            <p>No Image Selected</p>
                                        )
                                        : (
                                            <>
                                                <p class={css["selected"]}>{selectedImage()?.name}</p>
                                                <p class={css["selected"]}>{selectedImage()?.secondAttribute}</p>
                                            </>
                                        )
                                    }
                                </div>
                                <Button secondary icon>
                                    <Layout_Grid_01 />
                                </Button>
                            </div>
                            <div class={css["content-wrapper"]}>
                                <For each={images()}>
                                {(image, i) => (
                                    <>
                                        <button
                                            class={css["item"]}
                                                onClick={() => setSelectedImage({ name: image.name, secondAttribute: image.id })}
                                        >
                                            <img
                                                src={image.src}
                                                classList={{
                                                    [css["selected"]]: image.id === selectedImage()?.secondAttribute
                                                }}
                                            />
                                            <div class={css["descr"]}>
                                                <p>{image.name}</p>
                                                <p>{image.id}</p>
                                            </div>
                                        </button>
                                    </>
                                )}
                                </For>
                            </div>
                        </div>
                    </Show>
                </ContentWrapper>
                <WindowControls>
                    <Button secondary>Cancel</Button>
                    <Button primary>Apply</Button>
                </WindowControls>
            </Window>
        </>
    )
}
