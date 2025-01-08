import { Accessor, createEffect, createRoot, createSignal, Setter } from "solid-js"
import { ContentStack, Window } from "uikit/components/Window";

import css from "./imageBrowser.module.less";
import Button from "uikit/components/Button";
import { ContentWrapper } from "uikit/components/Window/window";
import { Layout_Grid_01 } from "components/Icons/layout-grid-01";
import { useLSManager } from "data/localStorageManagment/provider";
import { createSign } from "node:crypto";


type ImageBroserProps = {
    zIndex?: number,
    imageUrl: Setter<string>,
    visible: Accessor<boolean>
}

export const ImageBrowser = (props: ImageBroserProps) => {
    const tauriAvailable = window.__TAURI__;

    const [data, { addImage }] = useLSManager();

    const [isWindowVisible, setWindowVisible] = createSignal(true);
    const [isUIBlocked, setUIBlocked] = createSignal(false);
    const [isImageSelected, setImageSelected] = createSignal(false);
    const [selectedImagePath, setSelectedImagePath] = createSignal<undefined | string>(undefined);


    const pickImage = async () => {
        setUIBlocked(true);

        // Check tauri API availability
        if (tauriAvailable) {
            try {
                const { open } = window.__TAURI__.dialog;
                const input = await open({
                    multiple: true,
                    directory: false,
                });

                console.log(input);

                setUIBlocked(false);
            } catch (error) {
                console.error('Failed to open dialog using Tauri API:', error);

                setUIBlocked(false);
            }
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = "image/png, image/jpeg, image/gif, image/svg";

            input.onchange = () => {
                const rawInput = input.files;
                if (rawInput) {
                    const files = Array.from(rawInput);
                    console.log('File is chosen using default dialog:', files);

                    setUIBlocked(false);
                }
            };

            input.click();
        }
    };


    createEffect(() => {
        console.log(isUIBlocked());
    })


    return (
        <>
            <Window
                visible={isWindowVisible}
                setVisible={setWindowVisible}
                name={"Image Browser"}
                width={640}
            >
                <ContentWrapper>
                    <div class={css["controls-wrapper"]}>
                        <Button
                            primary
                            onClick={() => pickImage()}
                        >
                            Add
                        </Button>
                        <div class={css["img-props-container"]}>
                            {isImageSelected() === false
                                ? (
                                    <p>No Image Selected</p>
                                )
                                : (
                                    <>
                                        <p>Image Selected</p>
                                        {selectedImagePath() !== undefined && <p>{selectedImagePath()}</p>}
                                    </>
                                )
                            }
                        </div>
                        <Button secondary icon>
                            <Layout_Grid_01 />
                        </Button>
                    </div>
                </ContentWrapper>
            </Window>
        </>
    )
}
