import { Accessor, createEffect, createRoot, createSignal, For, Setter, Show } from "solid-js"
import { ContentStack, Window } from "uikit/components/Window";
import ImageProcessorWorker from "@/lib/webWorkers/imageProcessor.ts?worker";

import css from "./imageBrowser.module.less";
import Button from "uikit/components/Button";
import { ContentWrapper, WindowControls } from "uikit/components/Window/window";
import { Layout_Grid_01 } from "components/Icons/layout-grid-01";
import { createSign } from "node:crypto";
import { ButtonTypes } from "uikit/components/Button/button";
import { ContentLoadingIndicator } from "uikit/components/Indication/loading";
import { wrap } from "comlink";
import { ImageWorkerAPI } from "lib/webWorkers/imageProcessor";
import { useDBData } from "lib/dbInterface/provider";
import { InsertionImagesStore, LocalImageElement, LocalImageEntry } from "lib/dbInterface/images/handler";
import { createStore } from "solid-js/store";


type ImageBroserProps = {
    zIndex?: number,
    imageUrl: Setter<string>,
    visible: Accessor<boolean>
}

const imageProcessor = wrap<ImageWorkerAPI>(new ImageProcessorWorker());

export const ImageBrowser = (props: ImageBroserProps) => {
    const tauriAvailable = window.__TAURI__;

    const [isWindowVisible, setWindowVisible] = createSignal(true);
    const [isUIBlocked, setUIBlocked] = createSignal(false);
    const [selectedImage, setSelectedImage] = createSignal<
        undefined | { name: string, secondAttribute: string }
    >(undefined);

    const [images, setImages] = createSignal<undefined | LocalImageElement[]>(undefined);
    const [insertionImages, setInsertionImages] = createStore<InsertionImagesStore>({
        isRunning: false,
        inserted: 0,
        total: 0
    });

    const [dbMethods] = useDBData();

    createEffect(() => {
        const reactiveImages = dbMethods.getImages();
        const value = reactiveImages();

        if (value !== null) {
            setImages(value);
        }
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

            input.onchange = async () => {
                const rawInput = input.files;
                if (rawInput) {
                    const files = Array.from(rawInput);
                    console.log('File is chosen using default dialog:', files);

                    await dbMethods.setImages(files, setInsertionImages);

                    setUIBlocked(false);
                }
            };

            input.click();
        // }
    };


    createEffect(() => {
        console.log(insertionImages.isRunning);
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
                            <div class={css["indicator-wrapper"]}>
                                <ContentLoadingIndicator
                                    processName="Extracting Images..."
                                />
                            </div>
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
                                                src={image.preview}
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
