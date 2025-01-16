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
import { animate, spring } from "motion";
import { animationValues as av } from '../../components/definitions';


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
        images: [],
        inserted: -1,
        lastOperation: {
            isRunning: false,
            inserted: 0,
            total: 0,
        }
    });

    const [lastInsertion, setLastInsertion] = createStore(insertionImages.lastOperation);

    const [dbMethods] = useDBData();

    const [infoContainer, setInfoContainer] = createSignal<HTMLDivElement>();
    const [uploadingContainer, setUploadingContainer] = createSignal<HTMLDivElement>();
    const [uploadingContentWrapper, setUploadingContentWrapper] = createSignal<HTMLDivElement>();
    const [uploadingMessage, setUploadingMessage] = createSignal<string>("Uploading 0/0");
    const [imagesBuffer, setImagesBuffer] = createSignal<LocalImageElement[]>([]);

    let insertedImagesCount: number | null = null;

    createEffect(() => {
        const images = dbMethods.getImages();
        const value = images();

        if (value !== null) {
            setInsertionImages("images", (prev) => {
                if (prev.length) {
                    let i = insertionImages.inserted;

                    return prev.map((item) => {
                        const i = insertionImages.inserted;

                        if (item.preview === "undefined" && i < value.length) {
                            const newItem = value[i];
                            setInsertionImages("inserted", (prev) => prev + 1);
                            return newItem;
                        }

                        return item;
                    })
                } else {
                    // Correct `inserted` reactive value on first images get
                    setInsertionImages("inserted", value.length);
                    return value;
                }
            })
        }
    })

    createEffect(() => {
        console.log(insertionImages.inserted);
    })

    const countDigits = (num: number): number => {
        if (num === 0) return 1;
        return Math.floor(Math.log10(Math.abs(num))) + 1;
    }

    const measureTime = (fn: () => void): number => {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
    }

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

                    setLastInsertion("total", files.length);
                    animateUploadingContainer(true);
                    setInsertionImages("images", (prev) => [
                        ...prev,
                        ...Array.from({ length: files.length }, () => ({
                            id: "Awaiting upload",
                            name: "Uploading...",
                            preview: "undefined",
                            src: "undefined"
                        }))
                    ])

                    await dbMethods.setImages(files, setLastInsertion);

                    setLastInsertion("isRunning", false);

                    setTimeout(() => {
                        animateUploadingContainer(false, () => {
                            setLastInsertion("isRunning", false);
                        });
                    }, 1200)
                }
            };

            input.click();
        // }
    };

    const calcStringWidth = (
        text: string,
        font: string = "14px Inter"
    ): number => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return 0;

        context.font = font;
        return context.measureText(text).width;
    }


    const animateUploadingContainer = (show: boolean, fn?: () => void) => {
        const el = uploadingContainer();
        const uploadingContentWrapperEl = uploadingContentWrapper();
        const containerChilds = infoContainer()?.childNodes;
        if (!el || !uploadingContentWrapperEl || !containerChilds) return;

        const uploadingMessagePadding = calcStringWidth(uploadingMessage());
        const digitsPadding = lastInsertion.total;
        const spinnerWidth = 20;

        const totalWidth = spinnerWidth + uploadingMessagePadding + digitsPadding;
        const extraPadding = 10;

        let nextEl;

        if (containerChilds[0] === el) {
            nextEl = containerChilds[1] as HTMLElement;
        }

        if (show) {
            animate(
                el,
                {
                    width: ["0", `${totalWidth}px`],
                    paddingLeft: ["0", `${extraPadding}px`],
                    paddingRight: ["0", `${extraPadding}px`]
                },
                av.defaultAnimationType
            )

            if (nextEl) {
                animate(
                    nextEl,
                    { paddingLeft: ["0", `${extraPadding}px`] },
                    av.defaultAnimationType
                )
            }
        } else {
            animate(
                el,
                {
                    width: [`${totalWidth}px`, "0"],
                    paddingLeft: [`${extraPadding}px`, "0"],
                    paddingRight: [`${extraPadding}px`, "0"]
                },
                av.defaultAnimationType
            ).then(() => {
                if (fn) fn();
            })

            if (nextEl) {
                animate(
                    nextEl,
                    { paddingLeft: [`${extraPadding}px`, "0"] },
                    av.defaultAnimationType
                )
            }
        }
    }

    createEffect(() => {
        setUploadingMessage(`Uploading ${lastInsertion.inserted}/${lastInsertion.total}`);
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
                        when={true}
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
                                <div
                                    class={css["info-container"]}
                                    ref={setInfoContainer}
                                >
                                    <div
                                        class={css["uploading-container"]}
                                        ref={setUploadingContainer}
                                    >
                                        <div class={css["gradient-shade"]}></div>
                                        <ContentLoadingIndicator
                                            processName={uploadingMessage()}
                                            spinnerSize={20}
                                            ref={setUploadingContentWrapper}
                                            done={!lastInsertion.isRunning}
                                        />
                                    </div>
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
                                </div>
                                <Button secondary icon>
                                    <Layout_Grid_01 />
                                </Button>
                            </div>
                            <div class={css["content-wrapper"]}>
                                <For each={insertionImages.images}>
                                {(image, i) => (
                                    <>
                                        <button
                                            class={css["item"]}
                                                onClick={() => setSelectedImage({ name: image.name, secondAttribute: image.id })}
                                        >
                                            <div class={css["img-container"]}>
                                                <div
                                                    class={css["shade"]}
                                                    classList={{
                                                        [css["disable"]]: image.preview !== "undefined" && image.preview !== ""
                                                    }}
                                                ></div>
                                                <img
                                                    src={image.preview}
                                                    classList={{
                                                        [css["selected"]]: image.id === selectedImage()?.secondAttribute,
                                                        [css["view-available"]]: image.preview !== "undefined" && image.preview !== ""
                                                    }}
                                                />
                                            </div>
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
